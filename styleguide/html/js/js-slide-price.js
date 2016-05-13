var s = document.createElement('style'), 
    r = document.querySelector('[type=range]');

document.body.appendChild(s);

/* IE doesn't need the JS part & this won't work in IE anyway ;) */
r.addEventListener('input', function() {
  var val = this.value + '% 100%';
  
  val += ',' + val + ',100% 100%';
    
  s.textContent = 
    'input[type=range]::-webkit-slider-runnable-track{background-size:' + val + '}' + 
    'input[type=range]::-moz-range-track{background-size:' + val + '}';
}, false);