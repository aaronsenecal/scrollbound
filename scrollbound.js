(function($){
  'use strict';

  var scrollBound = {
    options: {
      'debounce': 30
    }
  };
  var $window = $(window);
  $.fn.scrollBound = function(action){
    $(this).filter(function() {
      var $this = $(this);
      return (((action && action != 'refresh') || $this.attr('data-trigger')) && (action == 'refresh' || !$this.hasClass('.scrollbound-processed')));
    }).each(function(){
      var element = $(this).addClass('scrollbound-pending').off('scrolled').data('scroll-triggers-active', 0);
      var triggers = [];
      var triggerString = (element.attr('data-trigger')) ? element.attr('data-trigger') : action;
      var triggerArray = triggerString.split(/;|\}/);
      $.each(triggerArray, function(i, v) {
        var matches = v.match(/:(:)?(\w[\w\d\-]*?)\s*?{/);
        var handle = (matches) ? matches[1] : null;
        v = $.trim(v).replace(/.*?\{|[;}]/g, '');
        matches = v.match(/[_|]:(:)?(before|after|middle)/);
        if (matches) {
          var divider = matches[0];
          var windowBound = divider.substring(divider.lastIndexOf(':')+1);
          matches = $.trim(v.replace(/(\s*)?[_|]:(:)?(before|after|middle)([<>]|\s*[<>])?/g, '')).match(/^.*:(:)?(before|after|middle)$/);
          if (matches) {
            var selector = matches[0].substring(0, matches[0].indexOf(':'));
            var triggerBound = matches[0].substring(matches[0].lastIndexOf(':') + 1);
            var trigger = ($(selector.substring(selector.indexOf(':'))).length) ? $(selector.substring(selector.indexOf(':'))).first() : element;
            matches = v.replace(divider, '').replace(selector, '').match(/[<>]/);
            if (matches) {
              var direction = matches[0];
              if (direction == '>' && v.indexOf(divider) > v.indexOf(selector)) {
                direction = '<';
              }
              else if (direction == '<' && v.indexOf(divider) > v.indexOf(selector)) {
                direction = '>';
              }
              var terms = (divider.charAt(0) == '|') ? ['scrollLeft', 'scrollRight', 'windowWidth', 'left', 'outerWidth'] : ['scrollTop', 'scrollBottom', 'windowHeight', 'top', 'outerHeight'];
              var scrollPos = (windowBound == 'after') ? function() {
                return scrollBound[terms[1]];
              } : ((scrollBound == 'middle') ? function() {
                return scrollBound[terms[0]] + scrollBound[terms[2]] / 2;
              } : function() {
                return scrollBound[terms[0]];
              });
              var triggerPos = (triggerBound == 'after') ? function() {
                return trigger.offset()[terms[3]] + trigger[terms[4]]();
              } : ((triggerBound == 'middle') ? function() {
                return trigger.offset()[terms[3]] + trigger[terms[4]]() / 2;
              } : function() {
                return trigger.offset()[terms[3]];
              });
              var inspect = (direction == '<') ? function() {
                return (scrollPos() < triggerPos());
              } : function() {
                return (scrollPos() > triggerPos());
              };
              triggers.push({handle: handle, rule: inspect});
            }
          }
        }
      });
      if (triggers.length > 0) {
        var rule = function() {
          return element.data('scroll-triggers-active');
        };
        $.each(triggers, function(i,v) {
          var classname = (v.handle) ? v.handle : 'scroll-trigger-'+i+'-active';
          var eventname = (v.handle) ? v.handle : 'scroll-trigger-'+i;
          rule = (function(oldrule){
            return function(){
              var actives = oldrule();
              var triggered = v.rule();
              var active = element.hasClass(classname);
              if (!active && triggered) {
                element.data('scroll-triggers-active', actives + 1).addClass(classname).trigger('scroll-trigger-on').trigger(eventname+'-on');
              }
              else if (active && !triggered) {
                element.data('scroll-triggers-active', actives - 1).removeClass(classname).trigger('scroll-trigger-off').trigger(eventname+'-off');
              }
              return element.data('scroll-triggers-active');
            };
          })(rule);
        });
        element.attr('data-trigger', triggerString).one('scrollbound-processed', function(){
          element.on('scrolled.scrollbound', function(){
            rule();
          });
          window.setTimeout(function(){
            element.triggerHandler('scrolled');
          },0);
        }).on('scroll-trigger-on scroll-trigger-off', function(){
          if (element.data('scroll-triggers-active') < 1) {
            element.removeClass('scroll-trigger-active');
          }
          else {
            element.addClass('scroll-trigger-active');
          }
        });
      }
      else {
        element.removeClass('scrollbound-pending scrollbound-processed');
      }
    });
    $(window).triggerHandler('scrollbound-init');
    return this;
  };
  $window.on('scrollbound-init scrollbound-debounced scroll.scrollbound resize.scrollbound', function(e){
    if (!scrollBound.debouncing && scrollBound.processed && scrollBound.processed.length > 0) {
      if (e.type != 'scroll') {
        scrollBound.windowHeight = $window.height();
        scrollBound.windowWidth = $window.width();
      }
      if (e.type != 'resize') {
        scrollBound.scrollTop = $window.scrollTop();
        scrollBound.scrollLeft = $window.scrollLeft();
      }
      scrollBound.scrollBottom = scrollBound.scrollTop + scrollBound.windowHeight;
      scrollBound.scrollRight = scrollBound.scrollLeft + scrollBound.windowWidth;
      if (e.type != 'scrollbound-init') {
        scrollBound.processed.trigger('scrolled');
      }
      if (scrollBound.options.debounce && (e.type == 'scroll' || e.type == 'resize')) {
        scrollBound.debouncing = window.setTimeout(function(){
          scrollBound.debouncing = false;
          $window.trigger('scrollbound-debounced');
        }, scrollBound.options.debounce);
      }
    }
  }).on('scrollbound-init', function(){
    $('.scrollbound-pending').removeClass('scrollbound-pending').addClass('scrollbound-processed').trigger('scrollbound-processed');
    scrollBound.processed = $('.scrollbound-processed');
  });
  $(function(){
    $('.scrollbound-ready').scrollBound();
  });
})(jQuery);
