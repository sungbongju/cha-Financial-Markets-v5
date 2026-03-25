#!/usr/bin/env python3
"""
Middleton 서버에 finbot server/ 코드를 배포하는 스크립트.
paramiko SSH + SFTP 사용 (Windows 환경, sshpass 불가)
"""
import paramiko
import os
import sys

SSH_HOST = '1.223.219.123'
SSH_PORT = 7822
SSH_USER = 'student04'
SSH_PASS = 'chacha2025'
REMOTE_BASE = '/home/student04/finbot/server'

# 전송할 파일 목록 (로컬 server/ 기준 상대경로)
FILES = [
    'index.js',
    'package.json',
    'routes/sts-stream.js',
    'routes/humelo-tts-stream.js',
    'routes/humelo-tts.js',
    'routes/db-save.js',
    'scripts/generate-cache.js',
    'scripts/cache-products.json',
    '.env.example',
]


def run_cmd(ssh, cmd, check=True):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        print(f'  OUT: {out}')
    if err:
        print(f'  ERR: {err}')
    return out, err


def main():
    local_base = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'server')
    local_base = os.path.normpath(local_base)

    print(f'[deploy] Connecting to {SSH_HOST}:{SSH_PORT}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS)
    print('[deploy] Connected.')

    sftp = ssh.open_sftp()

    # 원격 디렉토리 생성
    for d in ['', 'routes', 'scripts', 'tts-cache']:
        run_cmd(ssh, f'mkdir -p {REMOTE_BASE}/{d}')
    print('[deploy] Remote directories ready.')

    # 파일 전송
    for rel_path in FILES:
        local_path = os.path.join(local_base, rel_path.replace('/', os.sep))
        remote_path = f'{REMOTE_BASE}/{rel_path}'
        if not os.path.exists(local_path):
            print(f'  [skip] {rel_path} (not found locally)')
            continue
        sftp.put(local_path, remote_path)
        print(f'  [ok] {rel_path}')

    sftp.close()
    print('[deploy] Files transferred.')

    # npm install (production only)
    print('[deploy] Running npm install...')
    run_cmd(ssh, f'source ~/.nvm/nvm.sh && cd {REMOTE_BASE} && npm install --production 2>&1')

    # .env 파일 존재 확인 (경고만, PM2 재시작은 항상 진행)
    out, _ = run_cmd(ssh, f'test -f {REMOTE_BASE}/.env && echo EXISTS || echo MISSING')
    if 'MISSING' in out:
        print('[deploy] WARNING: .env file missing on server!')
        print(f'[deploy]   HUMELO_API_KEY 없이 서버 시작됨 — Humelo TTS 라우트는 동작하지 않습니다.')
        print(f'[deploy]   Create it: echo "HUMELO_API_KEY=<your-key>" > {REMOTE_BASE}/.env')
        print(f'[deploy]   Then restart: cd ~/finbot && source ~/.nvm/nvm.sh && npx pm2 restart finbot-server')
    else:
        print('[deploy] .env file found.')

    # PM2 재시작 (항상 실행)
    print('[deploy] Restarting PM2...')
    run_cmd(ssh, f'source ~/.nvm/nvm.sh && cd /home/student04/finbot && npx pm2 restart finbot-server 2>&1 || npx pm2 start server/index.js --name finbot-server 2>&1')

    # 헬스체크
    import time
    time.sleep(2)
    print('[deploy] Health check...')
    out, err = run_cmd(ssh, 'curl -s http://localhost:9000/health')
    if '"status":"ok"' in out:
        print('[deploy] SUCCESS: Server is healthy.')
    else:
        print('[deploy] WARNING: Health check failed. Check PM2 logs:')
        run_cmd(ssh, 'source ~/.nvm/nvm.sh && npx pm2 logs finbot-server --lines 20 --nostream 2>&1')

    ssh.close()
    print('[deploy] Done.')


if __name__ == '__main__':
    main()
