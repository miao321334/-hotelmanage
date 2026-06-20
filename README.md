# 易宿酒店管理平台

## 项目概述

易宿酒店管理平台为酒店商家和管理员提供 PC 端管理工具，支持酒店信息录入、审核发布、预订管理等核心功能。

## 技术栈

### 后端

| 技术 | 说明 |
|------|------|
| Node.js + NestJS | 模块化架构、TypeScript、依赖注入 |
| PostgreSQL | 关系型数据库 |
| Prisma | TypeScript ORM |
| JWT + bcrypt | 认证与密码加密 |
| Multer | 图片上传 |
| Swagger | API 文档 |

### PC 管理端（yisu-hotel-pc）

| 技术 | 说明 |
|------|------|
| Next.js 16 + React 19 | 服务端渲染框架 |
| TypeScript | 类型安全 |
| Ant Design 5 | 企业级 UI 组件库 |
| Axios | HTTP 客户端 |

## 项目结构

```
├── backend/                  # 后端（NestJS）
│   ├── prisma/               # 数据模型与迁移
│   └── src/                  # 源码
│       ├── auth/             # 认证模块
│       ├── hotels/           # 酒店管理
│       ├── reservations/     # 预订管理
│       ├── guests/           # 入住人员
│       └── tags/             # 标签管理
├── yisu-hotel-pc/            # PC 管理端（Next.js）
│   └── src/
│       ├── components/       # 通用组件
│       ├── lib/              # API 封装 & 认证
│       └── pages/            # 页面路由
│           ├── admin/        # 管理员页面
│           └── merchant/     # 商户页面
├── documents/                # 项目文档
└── docker-compose.yml        # 数据库容器（可选）
```

## 后端架构

### 模块划分

- **Auth**：注册、登录、JWT 认证
- **Hotels**：酒店 CRUD、图片上传、审核
- **Reservations**：预订创建与管理
- **Guests**：入住人员信息管理
- **Tags**：酒店标签管理

### 数据模型

- `User` — 用户（商户 / 管理员）
- `Hotel` — 酒店
- `HotelRoom` — 房型
- `HotelFacility` — 设施
- `HotelImage` — 图片
- `HotelPromotion` — 优惠
- `HotelNearbyAttraction` — 附近景点
- `HotelTag` / `HotelTagRelation` — 标签及关联
- `Reservation` — 预订
- `Guest` / `ReservationGuest` — 入住人员

## API 接口

### 认证

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|:--:|
| POST | /api/auth/register | 注册（merchant / admin） | - |
| POST | /api/auth/login | 登录，返回 JWT | - |
| GET | /api/auth/profile | 当前用户信息 | 是 |

### 酒店（商户）

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|:--:|
| POST | /api/hotels | 创建酒店 | 是 |
| GET | /api/hotels/merchant | 我的酒店列表 | 是 |
| GET | /api/hotels/:id | 酒店详情 | - |
| PUT | /api/hotels/:id | 更新酒店（重置为 pending） | 是 |
| DELETE | /api/hotels/:id | 删除酒店 | 是 |
| POST | /api/hotels/:id/images | 上传图片 | 是 |

### 酒店（管理员）

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|:--:|
| GET | /api/admin/hotels/pending | 待审核列表 | 是 |
| POST | /api/admin/hotels/:id/approve | 审核通过 | 是 |
| POST | /api/admin/hotels/:id/reject | 拒绝（填写原因） | 是 |
| POST | /api/admin/hotels/:id/offline | 下线 | 是 |
| POST | /api/admin/hotels/:id/online | 上线 | 是 |
| GET | /api/admin/hotels | 全部酒店列表 | 是 |

### 预订

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|:--:|
| POST | /api/reservations | 创建预订 | - |
| GET | /api/reservations | 预订列表 | 是 |
| GET | /api/reservations/:id | 预订详情 | - |
| PUT | /api/reservations/:id/check-in | 办理入住 | 是 |
| PUT | /api/reservations/:id/check-out | 办理退房 | 是 |
| PUT | /api/reservations/:id/cancel | 取消预订 | 是 |

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tags | 标签列表 |
| POST | /api/tags | 创建标签 |
| POST | /upload | 上传图片 |

> Swagger 文档：`http://localhost:3001/api`

## PC 管理端页面

### 商户端

- `/merchant/hotels` — 我的酒店列表
- `/merchant/hotels/new` — 新增酒店
- `/merchant/hotels/[id]/edit` — 编辑酒店

### 管理员端

- `/admin/audits` — 待审核酒店
- `/admin/hotels` — 全部酒店管理

### 公共

- `/login` — 登录
- `/register` — 注册

## 快速启动

### 前置条件

- Node.js 18+
- PostgreSQL（本地运行或 Docker）

### 1. 数据库

```bash
# 本地 PostgreSQL 服务
net start postgresql-x64-18

# 或使用 Docker
docker compose up -d yisu_hotel_booking_db
```

### 2. 后端

```bash
cd backend
npm install
# 创建 .env：
#   DATABASE_URL="postgresql://hotel_user:123456@localhost:5432/hotel_db"
#   JWT_SECRET="your-secret-key"
#   JWT_EXPIRES_IN="7d"
npm run start:dev   # http://localhost:3001
```

### 3. PC 管理端

```bash
cd yisu-hotel-pc
npm install
# 创建 .env.local：
#   NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev -- -p 3000   # http://localhost:3000
```

## 数据库设计

### 枚举类型

```
UserRole:           merchant | admin
HotelStatus:        pending | approved | rejected | offline
ReservationStatus:  confirmed | check_in | check_out | cancelled
DiscountType:       percentage | fixed | package
AttractionType:     attraction | transportation | shopping
IdType:             id_card | passport | other
```

## 核心业务流程

### 酒店上线

```
商户创建酒店（pending）→ 管理员审核
→ 通过（approved）→ 移动端可见
→ 拒绝（rejected，填写原因）
→ 管理员可随时下线 / 上线
```

### 预订流程

```
用户浏览酒店 → 选择房型 → 填写信息 → 提交预订
→ 商户办理入住（check_in）→ 退房（check_out）
```

## 开发规范

- TypeScript 严格模式
- RESTful API，统一错误格式
- 密码 bcrypt 加密，JWT 认证
- Prisma 参数化查询防 SQL 注入
- CORS 已启用

## 部署

```bash
# 后端
cd backend && npm run build && npm run start:prod

# 前端
cd yisu-hotel-pc && npm run build && npm start
```
