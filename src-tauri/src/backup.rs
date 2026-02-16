use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::project;

/// Tracks which files have been backed up in this session.
/// Only the first save per file creates a .bak copy.
pub struct BackupTracker {
    backed_up: Mutex<HashSet<PathBuf>>,
}

impl BackupTracker {
    /// Create a new empty tracker.
    pub fn new() -> Self {
        BackupTracker {
            backed_up: Mutex::new(HashSet::new()),
        }
    }

    /// Create a backup if this file has not been backed up yet in this session.
    /// Returns Ok(true) if a backup was created, Ok(false) if already backed up.
    pub fn backup_if_needed(&self, path: &std::path::Path) -> Result<bool, String> {
        let canonical = path.to_path_buf();
        let mut set = self.backed_up.lock()
            .map_err(|e| format!("Lock error: {}", e))?;

        if set.contains(&canonical) {
            return Ok(false);
        }

        // Only back up if the file exists
        if path.exists() {
            project::create_backup(path)
                .map_err(|e| format!("Backup failed for {}: {}", path.display(), e))?;
        }

        set.insert(canonical);
        Ok(true)
    }
}
