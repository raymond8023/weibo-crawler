from flask import Flask, request, jsonify, send_from_directory, render_template
import sqlite3
from contextlib import closing
import csv

app = Flask(__name__)

# 提供静态文件服务
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('./templates', path)

# 首页接口
@app.route('/', methods=['GET'])
def index():
    with open('../weibo/users.csv', mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)  # 使用 DictReader
        users = [row for row in reader]  # 将每行数据保存为字典
    if len(users) == 1:
        # 只有一个用户，直接进入微博页面
        profile(users[0]["用户id"]) # 待验证
    else:
        # 多个用户，显示用户页面（默认首页）
        return render_template('index.html', users=users)

# 微博列表接口
@app.route('/profile/<int:user_id>', methods=['GET'])
def profile(user_id):
    with open('../weibo/users.csv', mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)  # 使用 DictReader
        for row in reader:
            if row['用户id'] == str(user_id):  # 检查用户 ID
                user = row  # 找到目标用户
                break
        else:
            msg = "未找到目标用户!"
            return render_template('error.html', msg=msg)
    with closing(sqlite3.connect('../weibo/weibodata.db')) as conn:
        with conn:  # 使用事务
            cursor = conn.cursor()
            if request.method == 'GET':
                # 获取所有微博
                cursor.execute('SELECT * FROM weibo WHERE user_id = ?', (user_id,))
                weibos = cursor.fetchall()
                columns = [column[0] for column in cursor.description]
                # 将每一行数据转换为字典
                weibos_dict = [dict(zip(columns, row)) for row in weibos]
    return render_template('profile.html', user=user, weibos=weibos_dict)

# 微博正文接口
@app.route('/weibo/<int:weibo_id>', methods=['GET'])
def weibo(weibo_id):
    with closing(sqlite3.connect('../weibo/weibodata.db')) as conn:
        with conn:  # 使用事务
            cursor = conn.cursor()
            if request.method == 'GET':
                # 获取所有微博
                cursor.execute('SELECT * FROM weibo WHERE id = ?', (weibo_id,))
                weibo = cursor.fetchone()
                columns = [column[0] for column in cursor.description]
                # 将每一行数据转换为字典
                weibo_dict = dict(zip(columns, weibo))
    with open('../weibo/users.csv', mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)  # 使用 DictReader
        for row in reader:
            if row['用户id'] == str(weibo_dict['user_id']):  # 检查用户 ID
                user = row  # 找到目标用户
                break
        else:
            msg = "未找到目标用户!"
            return render_template('error.html', msg=msg)
    return render_template('weibo.html', user=user, weibo=weibo_dict)


@app.route('/content/<tab>')
def get_content(tab):
    # 模拟从数据库或其他来源获取内容
    if tab == 'repost':
        return {'content': '<p>这里是转发的内容。</p>'}
    elif tab == 'comment':
        return {'content': '<p>这里是评论的内容。</p>'}
    elif tab == 'good':
        return {'content': '<p>这里是点赞的内容。</p>'}
    else:
        return {'content': '<p>未知标签。</p>'}, 404

# 评论接口
@app.route('/comment', methods=['GET'])
def comment():
    with closing(sqlite3.connect('../weibo/weibodata.db')) as conn:
        with conn:  # 使用事务
            cursor = conn.cursor()
            if request.method == 'GET':
                # 获取所有评论
                cursor.execute('SELECT * FROM comment')
                comments = cursor.fetchall()
    return jsonify(comments)

# 启动服务器
if __name__ == '__main__':
    # app.run(host='localhost', port=80)
    app.run(host='0.0.0.0', port=80)
