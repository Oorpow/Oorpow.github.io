// 全局通用的一些函数或一开始要执行的全局代码

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function width() {
  return document.documentElement.clientWidth;
}

function height() {
  return document.documentElement.clientHeight;
}

// 创建一个轮播图区域
function createCarousel(carouselId, datas) {
  // 获取整个轮播图容器

  // 获取各种dom元素
  var container = document.getElementById(carouselId);
  var carouselList = container.querySelector(".g_carousel-list"); //轮播区域
  var indicator = container.querySelector(".g_carousel-indicator"); //指示器
  var prev = container.querySelector(".g_carousel-prev");
  var next = container.querySelector(".g_carousel-next");

  var curIndex = 0; // 当前显示的图片索引
  /**
   * 创建轮播图中的各种元素，并完成轮播图基本样式
   */
  function createCarouselElements() {
    var listHtml = ""; //设置轮播图内部的html
    var indHtml = ""; //设置指示器内部的html
    for (var i = 0; i < datas.length; i++) {
      var data = datas[i]; //一个个设置datas里的东西
      if (data.link) {
        listHtml += `<li>
          <a href="${data.link}" target="_blank">
            <img src="${data.img}">
          </a>
        </li>`;
      } else {
        listHtml += `<li>
          <img src="${data.img}">
        </li>`;
      }
      indHtml += `<li></li>`;
    }
    carouselList.style.width = `${datas.length}00%`;
    carouselList.innerHTML = listHtml;
    indicator.innerHTML = indHtml;
  }
  createCarouselElements();

  // 根据目前的索引，设置正确的状态
  function setStatus() {
    // 设置图片要显示的位置
    carouselList.style.marginLeft = -curIndex * width() + "px";
    var beforeSelected = indicator.querySelector(".selected");
    if (beforeSelected) {
      beforeSelected.classList.remove("selected");
    }
    // 设置指示器下的子元素增加选中样式
    indicator.children[curIndex].classList.add("selected");

    // 处理前后箭头
    if (prev) {
      if (curIndex == 0) {
        //图片为第一张时，禁用prev箭头
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }
    }
    if (next) {
      //图片为最后一张时，禁用next箭头
      if (curIndex == datas.length - 1) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    }
  }

  setStatus();
  // 去上一个
  function goPrev() {
    // 到达第一页时
    if (curIndex == 0) {
      return;
    }
    curIndex--;
    setStatus();
  }

  // 去下一个
  function goNext() {
    if (curIndex == datas.length - 1) {
      return;
    }
    curIndex++;
    setStatus();
  }
  // 存在前后箭头时
  if (prev) {
    prev.onclick = goPrev;
  }
  if (next) {
    next.onclick = goNext;
  }

  // 开始自动切换
  var timer = null;
  function autoPlay() {
    if (timer) {
      return;
    }
    timer = setInterval(function() {
      curIndex++;
      if (curIndex == datas.length) {
        curIndex = 0;
      }
      setStatus();
    }, 2000);
  }
  autoPlay();
  // 停止自动切换
  function stopPlay() {
    clearInterval(timer);
    timer = null;
  }

  // 手指事件
  container.ontouchstart = function(e) {
    e.stopPropagation(); // 阻止事件冒泡
    var x = e.touches[0].clientX; // 记录按下横坐标
    // 停止自动播放
    stopPlay();
    // 去掉过渡效果
    carouselList.style.transition = "none";
    var pressTime = Date.now(); // 手指按下的时间
    // 监听移动事件
    container.ontouchmove = function(e) {
      var dis = e.touches[0].clientX - x; // 计算拖动的距离
      carouselList.style.marginLeft = -curIndex * width() + dis + "px";
    };

    // 放手
    container.ontouchend = function(e) {
      var dis = e.changedTouches[0].clientX - x; // 计算拖动的距离
      autoPlay();
      // 加上过渡效果
      carouselList.style.transition = "";
      // 不再监听
      container.ontouchmove = null;
      var duration = Date.now() - pressTime; // 滑动的时间
      // 300毫秒内都算快速滑动
      if (duration < 300) {
        if (dis > 20 && curIndex > 0) {
          // 300毫秒内快速的向右滑动了至少20像素
          goPrev();
        } else if (dis < -20 && curIndex < datas.length - 1) {
          // 300毫秒内快速的向左滑动了至少20像素
          goNext();
        } else {
          setStatus();
        }
      } else {
        // 改动curIndex
        if (dis < -width() / 2 && curIndex < datas.length - 1) {
          goNext();
        } else if (dis > width() / 2 && curIndex > 0) {
          goPrev();
        } else {
          setStatus();
        }
      }
    };
  };
}
// ajax请求
async function ajax(url) {
  var reg = /http[s]?:\/\/[^/]+/;
  var matches = url.match(reg);
  if (matches.length === 0) {
    throw new Error("invalid url");
  }
  var target = matches[0];
  var path = url.replace(reg, "");
  return await fetch(`https://proxy.yuanjin.tech${path}`, {
    headers: {
      target,
    },
  }).then(r => r.json());
}
