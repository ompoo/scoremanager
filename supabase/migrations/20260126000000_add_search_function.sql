-- Create function to search books and songs with UNION ALL
CREATE OR REPLACE FUNCTION search_books_and_songs(
  search_query TEXT DEFAULT '',
  limit_count INT DEFAULT 10,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMPTZ,
  book_name TEXT,
  song_name TEXT,
  grade TEXT,
  book_id BIGINT,
  result_type TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sub.id,
    sub.created_at,
    sub.book_name,
    sub.song_name,
    sub.grade,
    sub.book_id,
    sub.result_type,
    COUNT(*) OVER() as total_count
  FROM (
    -- Books matching book_name
    (SELECT 
      b.id,
      b.created_at,
      b.book_name,
      NULL::TEXT as song_name,
      NULL::TEXT as grade,
      NULL::BIGINT as book_id,
      'book'::TEXT as result_type
     FROM books b
     WHERE search_query = '' OR b.book_name ILIKE '%' || search_query || '%')
    
    UNION ALL
    
    -- Songs matching song_name
    (SELECT 
      s.id,
      s.created_at,
      b.book_name,
      s.song_name,
      s.grade,
      s.book_id,
      'song'::TEXT as result_type
     FROM songs s
     INNER JOIN books b ON s.book_id = b.id
     WHERE search_query = '' OR s.song_name ILIKE '%' || search_query || '%')
  ) sub
  ORDER BY sub.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

