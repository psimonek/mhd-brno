// test support
let isSupported = false;

if ('wakeLock' in navigator) {
  isSupported = true;
    alert('Váš prohlížeč podporuje funkci wakeLock.\nV Případě sledování polohy bude obrazovka udržována rozsvícená.');
} else {
  alert('Váš prohlížeč nepodporuje funkci wakeLock.\nV Případě sledování polohy nebude obrazovka udržována rozsvícená.');
}

if (isSupported) {
  // create a reference for the wake lock
  let wakeLock = null;

  // create an async function to request a wake lock
  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');

      // change up our interface to reflect wake lock active
      //changeUI();

      // listen for our release event
      wakeLock.onrelease = function(ev) {
        console.log(ev);
      }
      //wakeLock.addEventListener('release', () => {
        // if wake lock is released alter the button accordingly
        //changeUI('released');
     //});

    } catch (err) {
      // if wake lock request fails - usually system related, such as battery
      statusElem.textContent = `${err.name}, ${err.message}`;

    }
  } // requestWakeLock()


  const handleVisibilityChange = () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
      requestWakeLock();
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);


} // isSupported
