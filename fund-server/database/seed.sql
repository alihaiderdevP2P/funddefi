-- Insert sample users
INSERT INTO users (id, email, name, password, wallet_address, avatar, bio, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', 'John Doe', '$2b$10$rOzJKjlNd5.WjGJKjlNd5.WjGJKjlNd5.WjGJKjlNd5.WjGJKjlNd5', '0x1234567890123456789012345678901234567890', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Passionate entrepreneur and tech innovator', true),
('550e8400-e29b-41d4-a716-446655440002', 'jane@example.com', 'Jane Smith', '$2b$10$rOzJKjlNd5.WjGJKjlNd5.WjGJKjlNd5.WjGJKjlNd5.WjGJKjlNd5', '0x2345678901234567890123456789012345678901', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Creative designer and sustainability advocate', true),
('550e8400-e29b-41d4-a716-446655440003', 'mike@example.com', 'Mike Johnson', '$2b$10$rOzJKjlNd5.WjGJKjlNd5.WjGJKjlNd5.WjGJKjlNd5.WjGJKjlNd5', '0x3456789012345678901234567890123456789012', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Environmental scientist and clean energy researcher', true);

-- Insert sample campaigns
INSERT INTO campaigns (id, title, description, summary, goal_amount, raised_amount, end_date, status, category, image_url, video_url, contract_address, backers_count, creator_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Solar-Powered Charging Stations', 'Revolutionary solar charging stations for urban environments. Our innovative design combines cutting-edge photovoltaic technology with smart grid integration to provide sustainable energy solutions for electric vehicles and mobile devices.', 'Sustainable charging infrastructure for the future of urban mobility', 50.0, 32.5, '2024-12-31 23:59:59', 'active', 'environment', '/solar-charging-station.jpg', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '0x1111111111111111111111111111111111111111', 156, '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', 'VR Metaverse Platform', 'Next-generation virtual reality platform that creates immersive digital worlds for education, entertainment, and social interaction. Built with cutting-edge VR technology and blockchain integration.', 'Building the future of virtual reality experiences', 100.0, 78.3, '2024-11-30 23:59:59', 'active', 'technology', '/virtual-reality-metaverse.png', null, '0x2222222222222222222222222222222222222222', 234, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440003', 'AI Health Monitoring Wearable', 'Advanced wearable device that uses artificial intelligence to monitor vital signs, predict health issues, and provide personalized wellness recommendations in real-time.', 'AI-powered health monitoring for everyone', 75.0, 45.2, '2024-10-31 23:59:59', 'active', 'health', '/ai-health-wearable-device.jpg', null, '0x3333333333333333333333333333333333333333', 189, '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample rewards
INSERT INTO rewards (id, title, description, min_amount, delivery_date, max_backers, current_backers, image_url, campaign_id) VALUES
-- Solar Charging Station rewards
('770e8400-e29b-41d4-a716-446655440001', 'Early Bird Special', 'Get your name on our supporter wall and exclusive updates', 0.1, '2025-01-15', 100, 45, null, '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', 'Solar Power Bank', 'Portable solar power bank with wireless charging capability', 0.5, '2025-02-28', 200, 78, null, '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', 'Home Solar Kit', 'Complete home solar charging kit with installation guide', 2.0, '2025-03-31', 50, 23, null, '660e8400-e29b-41d4-a716-446655440001'),

-- VR Platform rewards
('770e8400-e29b-41d4-a716-446655440004', 'VR Beta Access', 'Early access to VR platform beta and exclusive content', 0.2, '2024-12-15', 500, 156, null, '660e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', 'VR Headset Bundle', 'Custom VR headset with platform access and premium features', 1.5, '2025-01-31', 100, 67, null, '660e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440006', 'Developer License', 'Full developer access to create and monetize VR experiences', 5.0, '2025-02-28', 25, 11, null, '660e8400-e29b-41d4-a716-446655440002'),

-- AI Health Wearable rewards
('770e8400-e29b-41d4-a716-446655440007', 'Health Insights Report', 'Personalized health analysis and recommendations', 0.15, '2024-11-30', 300, 89, null, '660e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440008', 'AI Wearable Device', 'Complete AI health monitoring wearable with app access', 1.0, '2025-01-15', 150, 78, null, '660e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440009', 'Premium Health Suite', 'Wearable device plus premium health coaching service', 3.0, '2025-02-15', 30, 22, null, '660e8400-e29b-41d4-a716-446655440003');

-- Insert sample fundings
INSERT INTO fundings (id, amount, transaction_hash, status, message, backer_info, user_id, campaign_id, reward_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', 0.5, '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 'confirmed', 'Great project! Looking forward to the solar future.', '{"name": "Alice Cooper", "email": "alice@example.com"}', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440002', 1.5, '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'confirmed', 'VR is the future! Excited to be part of this journey.', '{"name": "Bob Wilson", "email": "bob@example.com"}', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005'),
('880e8400-e29b-41d4-a716-446655440003', 1.0, '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234', 'confirmed', 'Health monitoring innovation at its best!', '{"name": "Carol Davis", "email": "carol@example.com"}', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440008');
