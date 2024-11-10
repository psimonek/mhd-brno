// test support
let isSupported = false;

if ('wakeLock' in navigator) {
  isSupported = true;
  console.log('Prohlížeč podporuje wakeLock.');
} else {
  console.log('Prohlížeč nepodporuje wakeLock!!!');
}

if (isSupported) {
  // create a reference for the wake lock
  let wakeLock = null;
 console.log('Tady jsme v části isSuported.');
  // create an async function to request a wake lock
  const requestWakeLock = async () => {
    console.log('Tady jsme v části const requestWakeLock.');
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
