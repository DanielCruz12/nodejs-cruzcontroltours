(function () {
  'use strict';

  var dot = document.getElementById('live-dot');
  var pillText = document.getElementById('live-text');
  var lastCheck = document.getElementById('last-check');
  var stServer = document.getElementById('st-server');
  var stDb = document.getElementById('st-db');
  var stUptime = document.getElementById('st-uptime');
  var stEnv = document.getElementById('st-env');
  var stVersion = document.getElementById('st-version');

  function formatUptime(totalSeconds) {
    if (typeof totalSeconds !== 'number' || totalSeconds < 0) return '—';
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    if (days > 0) return days + ' d ' + hours + ' h';
    if (hours > 0) return hours + ' h ' + minutes + ' min';
    if (minutes > 0) return minutes + ' min ' + seconds + ' s';
    return seconds + ' s';
  }

  function setTone(el, tone) {
    el.classList.remove('ok', 'warn', 'bad');
    if (tone) el.classList.add(tone);
  }

  function renderOffline() {
    setTone(dot, 'bad');
    pillText.textContent = 'Sin conexión';
    stServer.textContent = 'Sin respuesta';
    setTone(stServer, 'bad');
    stDb.textContent = '—';
    setTone(stDb, null);
    lastCheck.textContent = new Date().toLocaleTimeString('es-MX');
  }

  function render(data) {
    var healthy = data.status === 'ok';
    var dbUp = data.database === 'up';

    setTone(dot, healthy ? 'ok' : 'warn');
    pillText.textContent = healthy ? 'En línea' : 'En línea (degradado)';

    stServer.textContent = healthy ? 'Operativo' : 'Operativo · revisar DB';
    setTone(stServer, healthy ? 'ok' : 'warn');

    stDb.textContent = dbUp ? 'Conectada' : 'Sin conexión';
    setTone(stDb, dbUp ? 'ok' : 'bad');

    stUptime.textContent = formatUptime(data.uptime);
    setTone(stUptime, null);

    stEnv.textContent = data.environment || '—';
    setTone(stEnv, null);

    stVersion.textContent = data.version ? 'v' + data.version : '—';
    setTone(stVersion, null);

    lastCheck.textContent = new Date().toLocaleTimeString('es-MX');
  }

  function refresh() {
    fetch('/health', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(render)
      .catch(renderOffline);
  }

  refresh();
  setInterval(refresh, 15000);
})();
