SELECT id,email,role FROM users WHERE role='ADMIN';
SELECT tour_id,image_url,is_primary FROM tour_images;
SELECT tour_id,day_number,title,LEFT(description,80) AS descr FROM tour_itineraries;