# 🚢 AutoSpace Deployment Master Guide

This guide details exactly where and how to deploy AutoSpace after containerizing with Docker. It covers the 3 primary production architectures: **Free/Low-Cost Modern PaaS**, **Single Cloud VPS (Docker Compose)**, and **Enterprise Cloud (AWS/GCP)**.

---

## 📊 Deployment Strategy Matrix

| Route | Platform Stack | Cost | Best For | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Route 1: Modern PaaS (Recommended)** | **Vercel** (Frontends) + **Render/Railway** (NestJS Docker) + **Neon/Supabase** (Postgres) | **$0 – $15/mo** (Generous Free Tiers) | Portfolio showcase, live demos, fast iteration | ⭐ Low |
| **Route 2: Single VPS (Self-Hosted)** | **DigitalOcean / Hetzner / Linode** VPS ($5/mo) running `docker-compose.prod.yml` + Nginx/Coolify | **$4 – $7/mo** (Fixed flat rate) | Full ownership, lowest cost for high traffic | ⭐⭐ Medium |
| **Route 3: Enterprise Cloud** | **AWS ECS Fargate** + **RDS PostgreSQL** + **CloudFront** CDN + **Route 53** | **$40 – $150+/mo** | Enterprise scale, SLA guarantees, institutional clients | ⭐⭐⭐ High |

---

## 🌟 Route 1: Modern PaaS (Vercel + Railway/Render + Neon)

This is the **fastest, cleanest, and most cost-effective way** to have a live production URL for interviewers.

### 1. Database: Managed PostgreSQL (Neon / Supabase)
1. Sign up at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) (both offer free serverless PostgreSQL).
2. Create a project named `autospace-prod`.
3. Copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-cool-fog-1234.us-east-2.aws.neon.tech/autospace?sslmode=require"
   ```

### 2. Backend API: Deploy Docker Container on Render or Railway
#### Option A: Render.com
1. Go to [Render Dashboard](https://dashboard.render.com/) ➔ **New Web Service**.
2. Connect your GitHub repository: `sushilsahoo06/autospace-workshop`.
3. Set **Runtime**: `Docker`.
4. Set **Docker Context**: `.` (Root directory).
5. Set **Dockerfile Path**: `apps/api/Dockerfile`.
6. Add Environment Variables:
   - `DATABASE_URL`: *(Your Neon/Supabase connection string)*
   - `JWT_SECRET`: *(A random 32+ character string)*
   - `STRIPE_SECRET_KEY`: `sk_test_...`
   - `PORT`: `3000`
7. Click **Deploy**. Render will build the Docker container and give you a public URL (e.g., `https://autospace-api.onrender.com/graphql`).
8. Run Prisma migrations via Render Shell or locally:
   ```bash
   DATABASE_URL="<your_remote_url>" yarn prisma db push
   ```

#### Option B: Railway.app
1. Go to [Railway.app](https://railway.app) ➔ **New Project** ➔ **Deploy from GitHub Repo**.
2. Set root directory to `apps/api` or use Dockerfile path `apps/api/Dockerfile`.
3. Railway automatically exposes port `3000` and generates an SSL domain (`https://autospace-api.up.railway.app`).

### 3. Frontend Web Apps: Deploy on Vercel
1. Go to [Vercel](https://vercel.com) ➔ **Add New Project**.
2. Select repository `sushilsahoo06/autospace-workshop`.
3. In **Root Directory**, click Edit and select `apps/web`.
4. Set Framework Preset: `Next.js`.
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://autospace-api.onrender.com/graphql`
   - `NEXTAUTH_URL`: `https://autospace.vercel.app`
   - `NEXTAUTH_SECRET`: `your-random-nextauth-secret-key-32chars`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: `pk.eyJ1_your_mapbox_token`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_test_...`
6. Click **Deploy**.
7. Repeat the same steps for `apps/web-admin` and `apps/web-valet` if you wish to deploy distinct subdomains (e.g. `admin.autospace.com` and `valet.autospace.com`).

---

## 🖥️ Route 2: Single Cloud VPS via Docker Compose ($5/month)

Deploy the entire stack (PostgreSQL + NestJS API + Web App + Nginx SSL) onto a single Virtual Private Server using **DigitalOcean**, **Hetzner Cloud** ($4/mo), or **AWS EC2**.

### 1. Provision a VPS
- Provision an **Ubuntu 22.04 LTS** server with 2 GB RAM / 1 vCPU (e.g., DigitalOcean Basic Droplet or Hetzner CX22 for €3.79/mo).
- SSH into your server:
  ```bash
  ssh root@your_server_ip
  ```

### 2. Install Docker & Docker Compose
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Clone Repository & Configure Environment
```bash
git clone https://github.com/sushilsahoo06/autospace-workshop.git
cd autospace-workshop

# Create production environment variables
cat << 'EOF' > .env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=super_secure_postgres_pass_2026
POSTGRES_DB=autospace
JWT_SECRET=production_jwt_secret_token_32chars_min
STRIPE_SECRET_KEY=sk_test_51...
CLOUDINARY_CLOUD_NAME=sushilsahoo
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EOF
```

### 4. Build & Launch Containers
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 5. Run Database Migrations Inside Container
```bash
docker exec -it autospace_api_prod npx prisma db push
```

### 6. Set Up Free SSL with Nginx & Certbot
Install Certbot for automated Let's Encrypt HTTPS certificates:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure Nginx reverse proxy in `/etc/nginx/sites-available/autospace`:
```nginx
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable site and obtain SSL:
```bash
sudo ln -s /etc/nginx/sites-available/autospace /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## ☁️ Route 3: Enterprise Cloud (AWS Production Setup)

For enterprise scale, high availability, and auto-scaling:

```mermaid
flowchart LR
    USERS(("👥 Users"))
    R53["AWS Route 53 (DNS)"]
    CF["AWS CloudFront (CDN)"]
    ALB["Application Load Balancer"]
    ECS["AWS ECS Fargate Cluster<br/>(Dockerized NestJS API)"]
    RDS[("Amazon RDS PostgreSQL<br/>(Multi-AZ Engine)")]
    S3["Amazon S3 Bucket<br/>(Static Assets)"]

    USERS --> R53
    R53 --> CF
    R53 --> ALB
    CF --> S3
    ALB --> ECS
    ECS --> RDS
```

1. **Database**: Amazon RDS for PostgreSQL (Multi-AZ for automated backups and failover).
2. **Container Orchestration**: AWS Elastic Container Service (ECS) with **AWS Fargate** (serverless container execution without managing EC2 instances).
3. **Container Registry**: AWS ECR (Elastic Container Registry) to store your Docker images.
4. **Frontends**: Next.js deployed via AWS Amplify or containerized on ECS behind an Application Load Balancer.

---

## 💡 What to Tell an Interviewer When Asked About Deployment

> *"For local development, we orchestrate PostgreSQL 15 with Docker Compose on port 2010.
> 
> For production deployment, we separate stateless application workloads from stateful data persistence:
> 1. **Frontends (Next.js)**: Deployed to **Vercel's global edge network** for sub-50ms static asset delivery and server-side rendering near the end user.
> 2. **Backend API (NestJS Code-First GraphQL)**: Containerized with a **multi-stage Dockerfile** using `node:18-alpine` and `dumb-init` to handle OS signals. It runs as a container on **Render/Railway** (or AWS ECS Fargate), auto-restarting and scaling based on memory thresholds.
> 3. **Database**: Hosted on a managed PostgreSQL cluster (Neon/Supabase or Amazon RDS) with pooled connections, SSL encryption in transit, and point-in-time recovery (PITR).
> 4. **CI/CD Pipeline**: GitHub Actions runs automated linting, test suites, and Docker image builds on every merge to `main`."*
