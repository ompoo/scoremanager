-- Function to get random books using ID array sampling (avoids ORDER BY random() on full table)
CREATE OR REPLACE FUNCTION get_random_books(limit_count int)
RETURNS SETOF books
LANGUAGE plpgsql
AS $$
DECLARE
    v_ids bigint[];
    v_sel_ids bigint[];
    v_count int;
    v_rand_idx int;
    i int;
BEGIN
    -- 1. Get all valid IDs into an array
    SELECT array_agg(id) INTO v_ids FROM books WHERE product_code IS NOT NULL;
    v_count := array_length(v_ids, 1);
    
    -- If no books found
    IF v_count IS NULL THEN
        RETURN;
    END IF;

    -- 2. If available books are fewer than requested, return all of them
    IF v_count <= limit_count THEN
        RETURN QUERY SELECT * FROM books WHERE id = ANY(v_ids);
        RETURN;
    END IF;

    -- 3. Pick unique random IDs
    v_sel_ids := ARRAY[]::bigint[];
    
    WHILE array_length(v_sel_ids, 1) IS NULL OR array_length(v_sel_ids, 1) < limit_count LOOP
        -- Generate random index (1-based for SQL arrays)
        v_rand_idx := floor(random() * v_count + 1)::int;
        
        -- Add to selection if not already picked (check for duplicates)
        IF NOT (v_ids[v_rand_idx] = ANY(v_sel_ids)) THEN
            v_sel_ids := array_append(v_sel_ids, v_ids[v_rand_idx]);
        END IF;
    END LOOP;

    -- 4. Return the actual book rows for the selected IDs
    RETURN QUERY SELECT * FROM books WHERE id = ANY(v_sel_ids);
END;
$$;