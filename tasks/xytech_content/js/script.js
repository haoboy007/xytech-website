/**
 * 雄元科技官网脚本
 * 实现响应式布局及交互功能
 */

document.addEventListener('DOMContentLoaded', () => {
  // 导航菜单交互
  initNavigation();
  
  // 滚动动画
  initScrollAnimations();
  
  // 业务领域交互
  initBusinessCards();
  
  // 联系表单验证
  initContactForm();
});

/**
 * 初始化导航菜单交互
 */
function initNavigation() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // 移动端菜单切换
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });
  }
  
  // 滚动时导航栏样式变化
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // 导航链接点击事件
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // 如果是页内链接
      if (this.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        
        // 关闭移动端菜单
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          mobileToggle.classList.remove('active');
        }
        
        // 滚动到目标位置
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // 设置当前活动导航项
  function setActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  
  window.addEventListener('scroll', setActiveNavItem);
}

/**
 * 初始化滚动动画
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in');
  
  // 检查元素是否在视口中
  function checkInView() {
    animatedElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 50) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }
  
  // 初始检查
  checkInView();
  
  // 滚动时检查
  window.addEventListener('scroll', checkInView);
}

/**
 * 初始化业务领域卡片交互
 */
function initBusinessCards() {
  const businessCards = document.querySelectorAll('.business-card');
  
  businessCards.forEach(card => {
    card.addEventListener('click', () => {
      // 获取业务ID
      const businessId = card.getAttribute('data-id');
      
      // 跳转到业务详情页面
      if (businessId) {
        window.location.href = `business-detail.html?id=${businessId}`;
      }
    });
  });
}

/**
 * 初始化联系表单验证
 */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // 获取表单数据
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };
      
      // 表单验证
      if (!validateForm(formData)) {
        return;
      }
      
      // 模拟表单提交
      try {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '提交中...';
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 显示成功消息
        showFormMessage('success', '您的消息已成功发送，我们将尽快与您联系！');
        contactForm.reset();
      } catch (error) {
        showFormMessage('error', '提交失败，请稍后再试。');
      } finally {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = '提交';
      }
    });
  }
  
  /**
   * 表单验证
   * @param {Object} formData - 表单数据
   * @returns {boolean} - 验证结果
   */
  function validateForm(formData) {
    // 清除之前的错误消息
    clearFormErrors();
    
    let isValid = true;
    
    // 验证姓名
    if (!formData.name.trim()) {
      showFieldError('name', '请输入您的姓名');
      isValid = false;
    }
    
    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showFieldError('email', '请输入有效的电子邮箱');
      isValid = false;
    }
    
    // 验证电话（可选）
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      showFieldError('phone', '请输入有效的手机号码');
      isValid = false;
    }
    
    // 验证主题
    if (!formData.subject.trim()) {
      showFieldError('subject', '请输入主题');
      isValid = false;
    }
    
    // 验证消息
    if (!formData.message.trim()) {
      showFieldError('message', '请输入您的留言内容');
      isValid = false;
    }
    
    return isValid;
  }
  
  /**
   * 显示字段错误消息
   * @param {string} fieldId - 字段ID
   * @param {string} message - 错误消息
   */
  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ff3333';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '0.25rem';
    
    field.classList.add('error');
    field.parentNode.appendChild(errorElement);
  }
  
  /**
   * 清除表单错误消息
   */
  function clearFormErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    const errorFields = document.querySelectorAll('.error');
    
    errorMessages.forEach(element => element.remove());
    errorFields.forEach(field => field.classList.remove('error'));
  }
  
  /**
   * 显示表单消息
   * @param {string} type - 消息类型 (success/error)
   * @param {string} message - 消息内容
   */
  function showFormMessage(type, message) {
    const formMessage = document.getElementById('formMessage');
    
    if (formMessage) {
      formMessage.textContent = message;
      formMessage.className = `form-message ${type}`;
      formMessage.style.display = 'block';
      
      // 5秒后隐藏消息
      setTimeout(() => {
        formMessage.style.display = 'none';
      }, 5000);
    }
  }
}

/**
 * 切换到指定页面
 * @param {string} page - 页面名称
 */
function navigateTo(page) {
  window.location.href = `${page}.html`;
}

/**
 * 显示业务详情
 * @param {number} id - 业务ID
 */
function showBusinessDetail(id) {
  window.location.href = `business-detail.html?id=${id}`;
}

/**
 * 异步提交联系表单
 * @param {Object} form - 表单数据
 * @returns {Promise<boolean>} - 提交结果
 */
async function submitContactForm(form) {
  // 这里是模拟提交，实际项目中应替换为真实的API请求
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('表单已提交:', form);
      resolve(true);
    }, 1000);
  });
}