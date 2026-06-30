# 阿里云 Ubuntu 部署说明

本文适用于在阿里云 Ubuntu 服务器上部署 LikeShop。项目已包含 Docker Compose 配置文件：`docker/docker-compose.yml`。

## 1. 服务器和安全组

建议服务器配置：

- Ubuntu 20.04 LTS / 22.04 LTS / 24.04 LTS
- 2 核 CPU 或以上
- 4 GB 内存或以上
- 40 GB 系统盘或以上

阿里云安全组入方向建议放行：

- TCP `22`：SSH 管理端口，建议限制为固定 IP
- TCP `80`：HTTP 访问端口
- TCP `443`：HTTPS 访问端口
- TCP `20208`：仅用于 README 中的一条 Docker 命令快速体验

正式上线建议只对公网开放 `80` 和 `443`，不要开放 MySQL `3306` 和 Redis `6379`。

## 2. 安装 Docker 和 Compose 插件

登录 Ubuntu 服务器后执行：

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo ${VERSION_CODENAME}) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

检查安装结果：

```bash
sudo docker version
sudo docker compose version
```

## 3. 拉取代码

```bash
git clone https://github.com/likeadmin-likeshop/likeshop.git
cd likeshop
```

如果使用私有仓库，请换成你自己的仓库地址，并确保服务器上的 SSH Key 或访问令牌有权限。

## 4. 使用 Docker Compose 部署

进入项目的 `docker` 目录：

```bash
cd docker
```

启动服务：

```bash
sudo docker compose up -d
sudo docker compose ps
```

查看日志：

```bash
sudo docker compose logs -f
```

当前 Compose 文件默认包含：

- `nginx`：对外映射 `80:80`、`443:443`
- `php7.2.4`：PHP-FPM 服务
- `mysql`：MySQL 5.7，容器名 `likeshop-mysql`
- `redis`：Redis 服务
- `node`：Node 服务

## 5. 首次初始化安装

Compose 部署默认访问：

```text
http://服务器公网IP/
```

如果进入安装页，数据库配置建议填写：

```text
数据库地址：likeshop-mysql
数据库端口：3306
数据库账号：root
数据库密码：root
数据库名称：likeshop
数据表前缀：ls_
```

安装页还需要设置后台管理员账号和密码。建议不要使用弱密码。

安装完成后会生成：

```text
server/.env
server/config/install.lock
```

`install.lock` 用于防止重复安装，请勿随意删除。

## 6. 访问地址

前台入口：

```text
http://服务器公网IP/
```

后台入口：

```text
http://服务器公网IP/admin
```

README 中的演示后台账号为 `admin / 123456`。如果你在安装页自己设置了管理员账号，请使用安装时填写的账号和密码登录。

## 7. README 快速体验方式

如果只是临时测试，也可以不用仓库内的 Compose，直接运行 README 中的一条 Docker 命令：

```bash
sudo docker run -d --name likeshop \
  -p 20208:80 \
  -e MYSQL_ROOT_PASSWORD=root \
  registry.cn-guangzhou.aliyuncs.com/likeshop/php-b2c:latest
```

访问：

```text
http://服务器公网IP:20208/
```

这种方式适合快速体验。正式上线更建议使用 Compose，并配置持久化、域名和 HTTPS。

## 8. 持久化目录

仓库自带 Compose 已经挂载了部分目录：

```text
docker/data/mysql5.7.29/lib -> MySQL 数据目录
docker/data/redis          -> Redis 数据目录
docker/log/nginx/logs      -> Nginx 日志目录
server                     -> 服务端代码目录
web                        -> 前端代码目录
```

上线前请确认这些目录不会被误删，并纳入备份策略。

## 9. 常用维护命令

进入 `docker` 目录后执行。

查看容器：

```bash
sudo docker compose ps
```

重启服务：

```bash
sudo docker compose restart
```

停止服务：

```bash
sudo docker compose down
```

查看日志：

```bash
sudo docker compose logs -f nginx
sudo docker compose logs -f mysql
sudo docker compose logs -f php7.2.4
```

## 10. 数据库备份

备份：

```bash
sudo docker compose exec mysql mysqldump -uroot -p likeshop > likeshop_$(date +%F).sql
```

恢复：

```bash
cat likeshop_2026-06-03.sql | sudo docker compose exec -T mysql mysql -uroot -p likeshop
```

执行命令时根据提示输入 MySQL root 密码。

## 11. 上线前安全检查

正式上线前至少完成：

- 修改 MySQL root 密码，并同步修改 `server/.env`
- 修改后台管理员密码
- 不向公网开放 `3306`、`6379`、`9004`、`8080`
- 使用域名访问，并配置 HTTPS
- 限制 SSH 登录来源 IP
- 定期备份 MySQL 数据和上传文件
- 检查 `server/config/install.lock` 是否存在
- 检查服务器磁盘空间是否充足

## 12. 端口调整建议

当前 Compose 已默认映射：

```yaml
ports:
  - "80:80"
  - "443:443"
```

如果你只想临时测试，且不想占用服务器 `80` 端口，可以把 `docker/docker-compose.yml` 中 `nginx` 的端口改成：

```yaml
ports:
  - "20208:80"
```

然后重新启动：

```bash
sudo docker compose down
sudo docker compose up -d
```

