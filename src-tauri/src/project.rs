use std::fs;
use std::io;
use std::path::{Path, PathBuf};

/// Metadata for a chapter file.
#[derive(Debug, Clone, serde::Serialize)]
pub struct ChapterMeta {
    pub filename: String,
    pub path: String,
    /// Relative path from the project root (includes subdirectory)
    pub relative_path: String,
}

/// List HTML files in a directory, recursively scanning subdirectories.
/// Sorted by relative path so chapters group by folder then filename.
pub fn list_html_files(dir: &Path) -> io::Result<Vec<ChapterMeta>> {
    let mut chapters: Vec<ChapterMeta> = Vec::new();
    collect_html_files(dir, dir, &mut chapters)?;

    // Sort by relative path for natural ordering
    chapters.sort_by(|a, b| a.relative_path.cmp(&b.relative_path));
    Ok(chapters)
}

/// Recursively collect HTML files from a directory tree.
fn collect_html_files(
    root: &Path,
    dir: &Path,
    chapters: &mut Vec<ChapterMeta>,
) -> io::Result<()> {
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            // Recurse into subdirectories
            collect_html_files(root, &path, chapters)?;
            continue;
        }

        // Check for .html or .htm extension
        let ext = path.extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        if ext == "html" || ext == "htm" {
            let filename = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();

            // Compute relative path from project root
            let relative = path.strip_prefix(root)
                .unwrap_or(&path)
                .to_string_lossy()
                .to_string();

            chapters.push(ChapterMeta {
                filename,
                path: path.to_string_lossy().to_string(),
                relative_path: relative,
            });
        }
    }
    Ok(())
}

/// Read the book.css file from the project directory, if it exists.
/// Also checks common locations like styles/ subdirectory.
pub fn read_css(dir: &Path) -> String {
    // Try common CSS file locations
    let candidates = [
        dir.join("book.css"),
        dir.join("style.css"),
        dir.join("styles.css"),
        dir.join("css/book.css"),
        dir.join("styles/book.css"),
    ];

    for candidate in &candidates {
        if let Ok(css) = fs::read_to_string(candidate) {
            return css;
        }
    }

    String::new()
}

/// Write content to a file atomically (write to .tmp, then rename).
pub fn atomic_write(path: &Path, content: &str) -> io::Result<()> {
    let tmp_path = path.with_extension("html.tmp");

    // Write to temporary file
    fs::write(&tmp_path, content)?;

    // Rename temp file to target (atomic on most filesystems)
    fs::rename(&tmp_path, path)?;

    Ok(())
}

/// Create a backup of a file by copying it to .html.bak.
pub fn create_backup(path: &Path) -> io::Result<PathBuf> {
    let backup_path = path.with_extension("html.bak");
    fs::copy(path, &backup_path)?;
    Ok(backup_path)
}
