# Smart Citizen Portal

Built as a final-year cloud computing project using AWS serverless architecture to improve citizen complaint management and civic issue prioritization.

A cloud-based citizen complaint management platform built using AWS services to help citizens report and track public issues efficiently.

The portal enables citizens to submit complaints related to civic issues such as potholes, garbage, water supply issues, sewage problems, and broken street lights. Complaints can be upvoted to highlight urgent problems, while administrators can review, manage, and update complaint statuses.

## Features

* Submit complaints with descriptions and optional photo uploads
* Upvote complaints to prioritize urgent civic issues
* Track complaint progress from submission to resolution
* Admin dashboard for complaint monitoring and management
* Complaint filtering and categorization
* Location detection support for issue reporting
* Complaint status updates (Submitted → Under Review → In Progress → Resolved)

## Technologies & Cloud Services Used

### Frontend

* HTML
* CSS
* JavaScript

### Cloud & Backend Services

* **Amazon S3**
  Used for website hosting and storing complaint images uploaded by users.

* **Amazon CloudFront**
  Used to improve frontend performance and content delivery through CDN caching.

* **AWS Lambda**
  Managed backend operations such as complaint submission, voting, status updates, and image uploads using a serverless architecture.

* **Amazon API Gateway**
  Connected the frontend application with backend services through APIs.

* **Amazon RDS (MySQL)**
  Securely stored complaint, voting, and related application data.

* **AWS IAM**
  Managed secure permissions and access control between AWS services.

* **Lambda Layers (mysql2)**
  Simplified database connectivity across backend Lambda functions.

## System Workflow

1. Citizens submit complaints through the portal.
2. Complaint data is sent via API Gateway.
3. AWS Lambda processes requests and business logic.
4. Complaint data is stored in Amazon RDS (MySQL).
5. Complaint images are stored in Amazon S3.
6. Admins review and update complaint statuses.
7. Citizens can track complaint progress and upvote important issues.

## Project Screenshots

### 1. Home Page

<img width="100%" alt="1-homepage" src="https://github.com/user-attachments/assets/899a8a06-e0f8-4e2a-88d3-1321cc91e260" />

### 2. Recent Complaints

<img width="100%" alt="2-recent complaints" src="https://github.com/user-attachments/assets/4fb75612-773c-495a-900d-84ac5f824894" />

### 3. Report Complaint

<img width="100%" alt="3-report complaint" src="https://github.com/user-attachments/assets/5b4860b0-c0f5-44dc-aad0-9638145193cc" />

### 4. Complaint Details

<img width="100%" alt="4-complaint details" src="https://github.com/user-attachments/assets/8fd34a85-8196-4d2f-9bae-61216bc46f4c" />

### 5. Complaint Submitted Successfully

<img width="100%" alt="5-complaint submitted" src="https://github.com/user-attachments/assets/15a526b1-d5d2-4899-85b9-e80205d21767" />

### 6. My Complaints

<img width="100%" alt="6-my complaints" src="https://github.com/user-attachments/assets/de3a56ab-e7a5-462a-91da-18fb9e7a7cc0" />

### 7. Dashboard

<img width="100%" alt="7-dashboard" src="https://github.com/user-attachments/assets/6c63dc82-2571-4a34-9425-c00384f195de" />

### 8. Admin Login

<img width="100%" alt="8-admin login" src="https://github.com/user-attachments/assets/ecb228ac-57d3-4bd4-b485-b66db85387a5" />

### 9. Admin Panel

<img width="100%" alt="9-admin-panel" src="https://github.com/user-attachments/assets/3ea82f5d-ecde-4ffa-8491-031b1b8b5a07" />

### 10. Admin Complaint Management

<img width="100%" alt="10-admin complaint management" src="https://github.com/user-attachments/assets/9e80867f-3911-411a-91dc-45cbc0504bf0" />

### 11. Priority by Citizens (Voting Feature)

<img width="100%" alt="11-priority by citizens" src="https://github.com/user-attachments/assets/6f234709-b47e-4ec4-ace5-0902bcd134a7" />

## Learning Outcomes

This project helped me gain hands-on experience in:

* Cloud Computing
* AWS Architecture
* Serverless Backend Development
* Database Integration
* API Development
* Frontend Development
* Secure Cloud Permissions Management
* Serverless Cloud Architecture
* API Integration using API Gateway
* Cloud Storage and Content Delivery
