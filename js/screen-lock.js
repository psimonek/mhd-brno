let wakeLock = null;

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock is active');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

async function releaseWakeLock() {
    if (wakeLock !== null) {
        await wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock is released');
    }
}

// Funkce pro zpracování změny viditelnosti
async function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        // Pokud se stránka stane viditelnou, znovu požádejte o wake lock
        await requestWakeLock();
    } else {
        // Pokud stránka není viditelná, uvolněte wake lock
        await releaseWakeLock();
    }
}

// Přidání posluchače události pro změnu viditelnosti
document.addEventListener('visibilitychange', handleVisibilityChange);

// Volání funkce pro požadavek na Wake Lock při načtení stránky
document.addEventListener('DOMContentLoaded', async () => {
    await requestWakeLock();
});
