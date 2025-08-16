// ===== Small helper for a nicer success message
const SG = {
  toast(msg){
    const n = document.createElement('div');
    n.className = 'notice';
    n.setAttribute('role','status');
    n.textContent = msg;
    document.querySelector('main').prepend(n);
    setTimeout(()=> n.remove(), 3000);
  }
};

$(function(){

  // ===== COURSES PAGE logic (runs only if #course-list exists)
  if ($('#course-list').length){

    // Country filter
    $('#country-select').on('change', function(){
      const c = this.value;
      $('.course-card').each(function(){
        const show = c === 'all' || $(this).data('country') === c;
        show ? $(this).slideDown(120) : $(this).slideUp(120);
      });
    });

    // Toggle details with click + keyboard support
    $('.details-btn')
      .on('click', function(){
        const $btn = $(this);
        const $detail = $btn.siblings('.details');
        const expanded = $btn.attr('aria-expanded') === 'true';
        $btn.attr('aria-expanded', !expanded);
        $detail.slideToggle(150);
      })
      .on('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(this).click(); }
      });
  }

  // ===== CONTACT PAGE logic (runs only if #contact-form exists)
  if ($('#contact-form').length){

    // Prefill from localStorage
    ['name','email','interest','message'].forEach(id=>{
      const v = localStorage.getItem('contact_' + id);
      if (v) $('#' + id).val(v);
    });
    $('#contact-form input, #contact-form select, #contact-form textarea')
      .on('input change', function(){
        localStorage.setItem('contact_' + this.id, $(this).val());
      });

    // Validate + submit
    $('#contact-form').on('submit', function(e){
      e.preventDefault();
      let ok = true;
      const mailre = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const $name = $('#name');
      if (!$name.val().trim()){
        ok = false;
        $name.next('.error').text('Please enter your name.').show();
      } else $name.next('.error').hide();

      const $email = $('#email');
      if (!mailre.test($email.val())){
        ok = false;
        $email.next('.error').text('Enter a valid email.').show();
      } else $email.next('.error').hide();

      if (!ok) return;

      SG.toast('Thanks! Your message has been sent.');
      // clear only contact_* keys
      Object.keys(localStorage).forEach(k => { if (k.startsWith('contact_')) localStorage.removeItem(k); });
      this.reset();
    });

    // Live clock
    setInterval(()=> $('#time').text(new Date().toLocaleString()), 1000);
  }

});
