import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
# 1. Try to load from .env.local in the project root
# 2. If running in GitHub Actions (or if .env.local is missing), os.getenv will pick up system env vars
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(base_dir, ".env.local")
load_dotenv(dotenv_path=env_path)

# Supabase Settings
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment variables.")
    exit(1)


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

ignoresplitlist = ["DISH//"]

def get_page(url):
    response = requests.get(url)
    response.encoding = 'utf-8'
    return response.text

def splitartist(texts):
    thistext = texts
    retrunlists = []
    for edgename in ignoresplitlist:
        if edgename in thistext:
            retrunlists.append(edgename)
            thistext = thistext.replace(edgename,"")
            
    if(not thistext == ""):
        retrunlists += list(thistext.split('/'))
    return retrunlists


def parse_html(html):
    soup = BeautifulSoup(html, 'html.parser')
    tracks = []

    # 収録曲数を取得
    num_tracks_element = soup.select_one('span[itemprop="numTracks"]')
    num_tracks = int(num_tracks_element.text.strip()) if num_tracks_element else 0
    
    name = soup.find('span',itemprop="name")
    bookname = re.sub(r"\s", "", name.get_text())
    print(bookname)
    # 各曲の情報を抽出
    for track in soup.select('tr[itemprop="track"]'):
        # 曲名を取得
        song_name = track.select_one('.main a span[itemprop="name"]').text.strip()
        artist = ""
        try:
            artist = (track.find('a', {'itemprop': 'byArtist'}).text.strip())
        except BaseException:
            artist = "none"
        # 主題歌や追加情報を取得
        additional_info_element = track.select_one('.main')
        #print(list(additional_info_element.stripped_strings))
        additional_info = []
        lyricist= "none"
        composer = "none"
        arranger= "none"
        
        fase = 0
        for text in additional_info_element.stripped_strings:
            if text in song_name or (fase == 0 and text in artist) :
                continue
            if(text == '作詞：'):
                fase = 1
                continue
            if(text == '作曲：'):
                fase = 2
                continue
            if(not text.find('編曲：') == -1):
                arranger = text.replace('編曲：','')
            elif(fase == 0):
                additional_info.append(text)
            elif(fase == 1):
                lyricist = text.strip()
            elif(fase == 2):
                composer = text.strip()
            

        # グレードを取得
        grade_element = track.select_one('.sub')
        grade = "none"
        if grade_element:
            for text in grade_element.stripped_strings:
                if "グレード：" in text:
                    grade = text.split("グレード：")[1].strip()
                    break
        
        

        tracks.append({
            '曲名': song_name,
            'メモ': additional_info,
            'アーティスト':splitartist(artist),
            '作詞者': list(lyricist.split('/')),
            '作曲者': list(composer.split('/')),
            '編曲者': list(arranger.split('/')),
            'グレード': grade.replace("級","")
        })

    return num_tracks, tracks,bookname

def get_or_create_entity(table, column, value):
    """
    Checks if an entity exists in the specified table.
    If yes, returns its ID.
    If no, inserts it and returns the new ID.
    """
    value = value.strip()
    if not value or value.lower() == "none":
        return None

    # Check existence
    response = supabase.table(table).select("id").eq(column, value).execute()
    if response.data:
        # print(f"{table} '{value}' が存在します")
        return response.data[0]['id']
    
    # Insert new
    # print(f"{table} '{value}' を作成します")
    response = supabase.table(table).insert({column: value}).execute()
    if response.data:
        return response.data[0]['id']
    return None

def update_notice_json(book_name):
    """
    Updates app/_component/notice.json with the new book.
    Keeps only the latest 3 entries.
    """
    notice_path = "app/_component/notice.json"
    
    if not os.path.exists(notice_path):
        print(f"Warning: Notice file not found at {notice_path}")
        return

    try:
        with open(notice_path, 'r', encoding='utf-8') as f:
            notices = json.load(f)
    except Exception as e:
        print(f"Error reading notice.json: {e}")
        notices = []

    new_notice = {
        "date": datetime.now().strftime('%Y.%m.%d'),
        "content": book_name,
        "end_txt": "追加されました"
    }

    # Add to beginning
    notices.insert(0, new_notice)

    # Keep only top 3
    notices = notices[:3]

    try:
        with open(notice_path, 'w', encoding='utf-8') as f:
            json.dump(notices, f, ensure_ascii=False, indent=4)
        print(f"Updated notice.json with {book_name}")
    except Exception as e:
        print(f"Error writing notice.json: {e}")

def main(code):
    # Check if book exists
    exist_response = supabase.table("books").select("id, book_name").eq("product_code", code).execute()
    if exist_response.data:
        print(f"{code} あるよ")
        print(exist_response.data[0]['book_name'])
        return

    base_url = 'https://www.ymm.co.jp/p/detail.php?code='+code+'&dm=d&o='
    all_tracks = []
    page_offset = 0
    bookname = ""

    while True:
        url = f"{base_url}{page_offset}"
        print(f"Fetching page with offset {page_offset}...")
        html = get_page(url)
        num_tracks, new_tracks, fetched_bookname = parse_html(html)
        
        if not bookname:
            bookname = fetched_bookname

        if not new_tracks:
            break

        all_tracks.extend(new_tracks)
        page_offset += 10

        # 最後のページで「次へ」ボタンが非表示の場合にループを終了
        if len(new_tracks) < 10:
            break

    # 総収録曲数を表示
    print(f"総収録曲数: {num_tracks}曲")
    
    # 抽出した曲の情報を表示
    for track in all_tracks:
        print(track['曲名'],track['メモ'],track['アーティスト'], track['作詞者'], track['作曲者'], track['編曲者'],track['グレード'])

    print("------------")
    
    # 楽譜集を作成
    book_response = supabase.table("books").insert({
        "book_name": bookname,
        "product_code": code
    }).execute()
    
    if not book_response.data:
        print("Failed to create book")
        return

    new_book_id = book_response.data[0]['id']
    print(f"Book created with ID: {new_book_id}")

    for track in all_tracks:
        memos = ""
        for i in track['メモ']:
            memos += (" " + i)

        # 新しい曲を作成
        song_response = supabase.table("songs").insert({
            "book_id": new_book_id,
            "song_name": track['曲名'],
            "grade": track['グレード'],
            "memo": memos.strip()
        }).execute()
        
        if not song_response.data:
            print(f"Failed to create song: {track['曲名']}")
            continue

        new_song_id = song_response.data[0]['id']

        # Helper to process relations
        def process_relations(items, table_name, name_col, assoc_table, assoc_col):
            for item in items:
                entity_id = get_or_create_entity(table_name, name_col, item)
                if entity_id:
                    supabase.table(assoc_table).insert({
                        "song_id": new_song_id,
                        assoc_col: entity_id
                    }).execute()

        # アーティストを曲に関連付け
        if track['アーティスト']:
             process_relations(track['アーティスト'], "artists", "Artist_name", "song_artist_association", "artist_id")

        # 作詞家を曲に関連付け
        process_relations(track['作詞者'], "lyricists", "lyricist_name", "song_lyricist_association", "lyricist_id")

        # 作曲家を曲に関連付け
        process_relations(track['作曲者'], "songwriters", "song_writer_name", "song_writer_association", "song_writer_id")

        # 編曲家を曲に関連付け
        process_relations(track['編曲者'], "arrangers", "arranger_name", "song_arranger_association", "arranger_id")

    # Update notice.json
    update_notice_json(bookname)
    
    print("データベースに楽譜集と曲を保存しました。")

    

def run():
    filename = "supabase/scripts/data.txt"
    
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        exit(1)
        
    print(f"Using data file: {filename}")
    with open(filename, 'r', encoding='utf-8') as f:
        datalist = f.readlines()
        for i in datalist:
            code = i.strip()
            if code:
                print(f"Processing: {code}")
                main(code)

if __name__ == '__main__':
    run()
