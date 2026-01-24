-- Add password field to users table for email/password authentication
ALTER TABLE `users` ADD COLUMN `password` varchar(255);

-- Make email unique (if not already)
-- Note: This may fail if there are duplicate emails - in that case, run manually
-- ALTER TABLE `users` ADD UNIQUE INDEX `users_email_unique` (`email`);
