#!/bin/bash

# Migration script to add user roles to existing database
# This script should be run if you have an existing database without the role column

echo "Running migration: Add user roles to existing database..."

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw crowdfunding; then
    echo "Database 'crowdfunding' does not exist. Please run the init.sql script first."
    exit 1
fi

# Run the migration
echo "Adding role column to users table..."
psql -d crowdfunding -f migrations/add_user_roles.sql

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
    echo "All existing users have been assigned the 'user' role by default."
    echo "You can now update specific users to 'admin' or 'superadmin' roles as needed."
else
    echo "Migration failed. Please check the error messages above."
    exit 1
fi
