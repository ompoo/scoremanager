import json
import os

# パス設定
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
JSON_PATH = os.path.join(BASE_DIR, ".gemini", "output.json")
SQL_OUTPUT_PATH = os.path.join(BASE_DIR, "supabase", "seed.sql")

def generate_insert_sql(table_name, columns, data_list, batch_size=1000):
    if not data_list:
        return ""
    
    sqls = []
    total = len(data_list)
    
    for i in range(0, total, batch_size):
        batch = data_list[i:i+batch_size]
        values_list = []
        
        for item in batch:
            row_values = []
            for col in columns:
                val = item.get(col)
                # SQLのエスケープ処理とフォーマット
                if val is None:
                    row_values.append("NULL")
                elif isinstance(val, str):
                    # シングルクォートをエスケープ
                    safe_val = val.replace("'", "''")
                    row_values.append(f"'{safe_val}'")
                elif isinstance(val, (int, float)):
                    row_values.append(str(val))
                else:
                    # その他の型（日付など）は文字列として扱う
                    safe_val = str(val).replace("'", "''")
                    row_values.append(f"'{safe_val}'")
            
            values_list.append(f"({', '.join(row_values)})")
        
        # カラム名を列挙
        cols_str = ", ".join([f'"{c}"' if c.lower() != c else c for c in columns]) # Artist_name等はダブルクォートが必要かもだが、postgresは通常小文字。Artist_nameはschemaで"Artist_name"となっていたか要確認。
        # schema.md では "Artist_name" text となっている。
        
        sql = f"INSERT INTO {table_name} ({cols_str}) VALUES\n" + ",\n".join(values_list) + ";"
        sqls.append(sql)
        
    return "\n\n".join(sqls)

def main():
    print(f"Reading JSON from {JSON_PATH}...")
    try:
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: output.json not found.")
        return

    sql_content = ["-- Generated Seed Data"]

    # 1. Books
    print("Generating SQL for Books...")
    sql_content.append(generate_insert_sql("books", ["id", "book_name", "product_code", "created_at"], data.get("books", [])))

    # 2. Artists
    print("Generating SQL for Artists...")
    # Schema says "Artist_name", so we quote it just in case, or match the table definition. 
    # In migration file: "Artist_name" text NOT NULL. So we should use "Artist_name".
    sql_content.append(generate_insert_sql("artists", ["id", "Artist_name"], data.get("artists", [])))

    # 3. Lyricists
    print("Generating SQL for Lyricists...")
    sql_content.append(generate_insert_sql("lyricists", ["id", "lyricist_name"], data.get("lyricists", [])))

    # 4. SongWriters
    print("Generating SQL for SongWriters...")
    # JSON key is "song_writers", table is "songwriters". Column is "song_writer_name"
    sql_content.append(generate_insert_sql("songwriters", ["id", "song_writer_name"], data.get("song_writers", [])))

    # 5. Arrangers
    print("Generating SQL for Arrangers...")
    sql_content.append(generate_insert_sql("arrangers", ["id", "arranger_name"], data.get("arrangers", [])))

    # 6. Songs
    print("Generating SQL for Songs...")
    # JSON has relationship arrays which are not columns in songs table.
    # We filter them out inside the loop logic conceptually, but here we just specify columns we want.
    songs_data = data.get("songs", [])
    sql_content.append(generate_insert_sql("songs", ["id", "book_id", "song_name", "grade", "memo", "created_at"], songs_data))

    # 7. Association Tables
    print("Generating SQL for Associations...")
    
    # Prepare association data lists
    song_artist_list = []
    song_lyricist_list = []
    song_writer_list = []
    song_arranger_list = []

    for song in songs_data:
        s_id = song.get("id")
        # Artist
        for a_id in song.get("artist_ids", []):
            song_artist_list.append({"song_id": s_id, "artist_id": a_id})
        # Lyricist
        for l_id in song.get("lyricist_ids", []):
            song_lyricist_list.append({"song_id": s_id, "lyricist_id": l_id})
        # SongWriter
        for sw_id in song.get("song_writer_ids", []):
            song_writer_list.append({"song_id": s_id, "song_writer_id": sw_id})
        # Arranger
        for ar_id in song.get("arranger_ids", []):
            song_arranger_list.append({"song_id": s_id, "arranger_id": ar_id})

    sql_content.append(generate_insert_sql("song_artist_association", ["song_id", "artist_id"], song_artist_list))
    sql_content.append(generate_insert_sql("song_lyricist_association", ["song_id", "lyricist_id"], song_lyricist_list))
    sql_content.append(generate_insert_sql("song_writer_association", ["song_id", "song_writer_id"], song_writer_list))
    sql_content.append(generate_insert_sql("song_arranger_association", ["song_id", "arranger_id"], song_arranger_list))

    # Reset Identity sequences (Important for PostgreSQL so next auto-increment ID is correct)
    print("Adding sequence reset commands...")
    sql_content.append("\n-- Reset sequences")
    tables = ["books", "songs", "artists", "lyricists", "songwriters", "arrangers"]
    for t in tables:
        sql_content.append(f"SELECT setval(pg_get_serial_sequence('{t}', 'id'), (SELECT MAX(id) FROM {t}));")

    # Write to file
    with open(SQL_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n\n".join(sql_content))
    
    print(f"Done! SQL file generated at: {SQL_OUTPUT_PATH}")

if __name__ == "__main__":
    main()
