document.addEventListener('DOMContentLoaded', function() {
    const tabDivs = document.querySelectorAll('.footeritem');
    const contentContainer = document.getElementById('content-container');
  
    // 初始化第一个标签为选中状态
    tabDivs[1].classList.add('active');
    fetchContent('comment');
  
    tabDivs.forEach(tab => {
      tab.addEventListener('click', function() {
        // 移除所有标签的选中状态
        tabDivs.forEach(tab => tab.classList.remove('active'));
        // 添加当前点击的标签的选中状态
        this.classList.add('active');
  
        // 获取标签的内容并通过AJAX请求获取数据
        const tabContent = this.getAttribute('data-tab');
        fetchContent(tabContent);
      });
    });
  
    function fetchContent(tabContent) {
      fetch('/content/'+tabContent)
        .then(response => response.json())
        .then(data => {
          contentContainer.innerHTML = data.content;
        })
        .catch(error => {
          console.error('Error fetching content:', error);
          contentContainer.innerHTML = '<p>无法加载内容。</p>';
        });
    }
  });