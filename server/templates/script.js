function formatDate(timeString) {
    const date = new Date(timeString); // 解析日期字符串
    const year = date.getFullYear(); // 获取年份
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份（补零）
    const day = String(date.getDate()).padStart(2, '0'); // 获取日期（补零）
//    const hours = String(date.getHours()).padStart(2, '0'); // 获取小时（补零）
//    const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟（补零）
//    const seconds = String(date.getSeconds()).padStart(2, '0'); // 获取秒数（补零）
    // 返回自定义格式的日期字符串
    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const tabDivs = document.querySelectorAll('.footeritem');
    const contentContainer = document.getElementById('content-container');
  
    // 初始化第一个标签为选中状态
    tabDivs[1].classList.add('active');
    fetchContent('comment', tabDivs[1].getAttribute('data-weiboid'));
  
    tabDivs.forEach(tab => {
      tab.addEventListener('click', function() {
        // 移除所有标签的选中状态
        tabDivs.forEach(tab => tab.classList.remove('active'));
        // 添加当前点击的标签的选中状态
        this.classList.add('active');
  
        // 获取标签的内容并通过AJAX请求获取数据
        const tabAction = this.getAttribute('data-action');
        const weiboId = this.getAttribute('data-weiboid')
        fetchContent(tabAction, weiboId);
      });
    });
  
    function fetchContent(tabAction, weiboId) {
      if(tabAction == "good"){
        contentContainer.innerHTML = "";
        return;
      }
      fetch('/'+tabAction+'/'+weiboId)
        .then(response => response.json())
        .then(data => {
          contentContainer.innerHTML = data.map(item => `
            <div class="card">
                <div class="contentitem">
                    <div class="contentavatar">
                        <img src="${item.user_avatar_url}">
                    </div>
                    <div class="content">
                        <div class="contentuser">
                            <text>${item.user_screen_name}</text>
                        </div>
                        <div class="contenttext">
                            <text>${item.text}</text>
                        </div>
                        ${item.reply && item.reply.length > 0 ? `
                            <div class="contentreply">
                                ${item.reply.map(reply => `
                                    <div class="relpyitem">
                                        <text>${reply.user_screen_name}${reply.text.startsWith("回复<a href=") ? reply.text : `:${reply.text}`}</text>
                                    </div>
                                `).join('')}
                                ${item.reply[item.reply.length - 1].row_num < item.max_row_num ? `
                                    <div class="replymore">
                                        <text>获取更多...</text>
                                    </div>
                                ` : ""}
                            </div>` : ''}
                        <div class="contentfoot">
                            <div class="contenttime">
                                <text>${formatDate(item.created_at)}</text>
                            </div>
                            <div class="contentlike">
                                <img src="/img/good.png">
                                <text>${item.like_count}</text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          `).join('');
        })
        .catch(error => {
          console.error('Error fetching content:', error);
          contentContainer.innerHTML = '<p>无法加载内容。</p>';
        });
    }
  });