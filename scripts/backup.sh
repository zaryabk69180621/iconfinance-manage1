#!/bin/bash
# MongoDB Backup Script for Linux / WSL
# Runs backup to Desktop/DB_Backups

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/.." || exit 1

/usr/bin/node scripts/backup.js >> backup.log 2>&1
