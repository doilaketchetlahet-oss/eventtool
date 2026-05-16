-- Atomic increment function for download counts (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_download_count(row_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE apps SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
