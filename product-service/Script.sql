create extension if not exists "uuid-ossp";

create table if not exists products (
	id uuid primary key default uuid_generate_v4(),
	isbn text not null,
	title text not null,
	author text,
	publisher text not null,
	description text,
	year integer not null,
	price money
)

insert into products (isbn, title, author, publisher, description, year, price, count) values
('9781617292576','Node.js in Action','Alex Young, Bradley Meck, and Mike Cantelon','Manning','Node.js in Action, Second Edition is a thoroughly revised product based on the best-selling first edition. It starts at square one and guides you through all the features, techniques, and concepts you''ll need to build production-quality Node applications.',2017,24.99),
('9781617294723','Serverless Applications with Node.js','Slobodan Stojanovi? and Aleksandar Simovi?','Manning','Serverless Applications with Node.js walks you through building serverless apps on AWS using JavaScript. Inside, you''ll discover what Claudia.js brings to the table as you build and deploy a scalable event-based serverless application, based around a pizzeria that�s fully integrated with AWS services, including Lambda and API Gateway. Each chapter is filled with exercises, examples, tips, and more to make sure you�re ready to bring what you�ve learned into your own work.',2019,23.39),
('9781617293719','AWS Lambda in Action','Danilo Poccia','Manning','AWS Lambda in Action is an example-driven tutorial that teaches you how to build applications that use an event-driven approach on the back end.',2016,24.99),
('9781617297335','AWS Security','Dylan Shields','Manning','AWS Security is an invaluable guide that you�ll want to have on hand when you�re facing any cloud security problem. With a cookproduct-style delivery, it�s filled with well-documented examples and procedures you can apply to common AWS security issues. This product covers best practices for access policies, data protection, auditing, continuous monitoring, and incident response. You�ll also explore several deliberately insecure applications, including a social media site and a mobile app, learning the exploits and vulnerabilities commonly used to attack them and the security practices to counter those attacks. With this practical primer, you�ll be well prepared to evaluate your system�s security, detect threats, and respond with confidence.',2020,24.99);

select * from products;

create table if not exists stocks (
	product_id uuid,
	count integer,
	foreign key ("product_id") references "products" ("id")
)

insert into stocks (product_id, count) values
('c023bff7-6fa0-4fea-a738-68fe164f4f0c',10),
('e14f4369-fda1-4103-bedb-319572c19d17',12),
('11ba687a-42e9-477c-9f9c-3aecd3a2472c',8),
('dc5a6916-308b-4880-bcab-60f690603f20',5)

select * from stocks;