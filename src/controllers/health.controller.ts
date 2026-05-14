import { Request, Response } from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';

const MB = 1024 * 1024;
const GB = 1024 * MB;

const bytesAMB = (b: number) => (b / MB).toFixed(2) + ' MB';
const bytesAGB = (b: number) => (b / GB).toFixed(2) + ' GB';
const porcentaje = (n: number) => n.toFixed(2) + '%';

const getCpuUso = (): Promise<number> =>
  new Promise((resolve) => {
    const inicio = os.cpus().map((c) => ({ ...c.times }));
    setTimeout(() => {
      const fin = os.cpus();
      let totalInicio = 0, totalFin = 0, idleInicio = 0, idleFin = 0;
      fin.forEach((cpu, i) => {
        const ini = inicio[i];
        totalInicio += Object.values(ini).reduce((a, b) => a + b, 0);
        totalFin    += Object.values(cpu.times).reduce((a, b) => a + b, 0);
        idleInicio  += ini.idle;
        idleFin     += cpu.times.idle;
      });
      const total = totalFin - totalInicio;
      const idle  = idleFin - idleInicio;
      resolve(total === 0 ? 0 : ((total - idle) / total) * 100);
    }, 200);
  });

const getInfoSistema = () => ({
  sistemaOperativo: os.type(),
  plataforma:       os.platform(),
  version:          os.release(),
  arquitectura:     os.arch(),
  nombreHost:       os.hostname(),
  usuarioSistema:   os.userInfo().username,
  directorioHome:   os.userInfo().homedir,
  nucleosCPU:       os.cpus().length,
  modeloCPU:        os.cpus()[0]?.model ?? 'N/A',
  tiempoActivoSeg:  os.uptime(),
  tiempoActivoHoras: (os.uptime() / 3600).toFixed(2) + ' h',
});

const getInfoMemoria = () => {
  const total  = os.totalmem();
  const libre  = os.freemem();
  const enUso  = total - libre;
  return {
    totalRAM:      bytesAGB(total),
    enUsoRAM:      bytesAMB(enUso),
    libreRAM:      bytesAMB(libre),
    porcentajeUso: porcentaje((enUso / total) * 100),
  };
};

const getRecursosProceso = () => {
  const mem = process.memoryUsage();
  return {
    heapUsado:    bytesAMB(mem.heapUsed),
    heapTotal:    bytesAMB(mem.heapTotal),
    rssRAM:       bytesAMB(mem.rss),
    externo:      bytesAMB(mem.external),
    versionNode:  process.version,
    pid:          process.pid,
    uptime:       process.uptime().toFixed(2) + ' s',
  };
};

export const getHealth = async (req: Request, res: Response): Promise<void> => {
  const cpuUso = await getCpuUso();

  res.json({
    estado:        'online',
    timestamp:     new Date().toISOString(),
    sistema:       getInfoSistema(),
    memoria:       getInfoMemoria(),
    cpu: {
      uso:         porcentaje(cpuUso),
      nucleos:     os.cpus().length,
      modelo:      os.cpus()[0]?.model ?? 'N/A',
    },
    proceso:       getRecursosProceso(),
  });
};

export const getHealthReport = async (req: Request, res: Response): Promise<void> => {
  const cpuUso   = await getCpuUso();
  const sistema  = getInfoSistema();
  const memoria  = getInfoMemoria();
  const proceso  = getRecursosProceso();
  const ahora    = new Date();

  const lineas = [
    '============================================================',
    '       REPORTE DE SALUD DEL SERVIDOR — SISTEMA DE TURNOS',
    '============================================================',
    '',
    `Fecha y hora       : ${ahora.toLocaleString()}`,
    `Timestamp ISO      : ${ahora.toISOString()}`,
    `Estado             : ONLINE`,
    '',
    '──────────────────────────────────────────────────────────',
    ' SISTEMA OPERATIVO',
    '──────────────────────────────────────────────────────────',
    `Sistema operativo  : ${sistema.sistemaOperativo}`,
    `Plataforma         : ${sistema.plataforma}`,
    `Versión            : ${sistema.version}`,
    `Arquitectura       : ${sistema.arquitectura}`,
    `Nombre de host     : ${sistema.nombreHost}`,
    `Usuario del sistema: ${sistema.usuarioSistema}`,
    `Directorio home    : ${sistema.directorioHome}`,
    `Tiempo activo      : ${sistema.tiempoActivoHoras}`,
    '',
    '──────────────────────────────────────────────────────────',
    ' CPU',
    '──────────────────────────────────────────────────────────',
    `Modelo             : ${sistema.modeloCPU}`,
    `Núcleos            : ${sistema.nucleosCPU}`,
    `Uso actual         : ${porcentaje(cpuUso)}`,
    '',
    '──────────────────────────────────────────────────────────',
    ' MEMORIA RAM',
    '──────────────────────────────────────────────────────────',
    `Total              : ${memoria.totalRAM}`,
    `En uso             : ${memoria.enUsoRAM}`,
    `Libre              : ${memoria.libreRAM}`,
    `Porcentaje en uso  : ${memoria.porcentajeUso}`,
    '',
    '──────────────────────────────────────────────────────────',
    ' RECURSOS DEL PROCESO (SERVIDOR NODE.JS)',
    '──────────────────────────────────────────────────────────',
    `PID                : ${proceso.pid}`,
    `Versión Node.js    : ${proceso.versionNode}`,
    `Uptime proceso     : ${proceso.uptime}`,
    `RAM usada (RSS)    : ${proceso.rssRAM}`,
    `Heap usado         : ${proceso.heapUsado}`,
    `Heap total         : ${proceso.heapTotal}`,
    `Memoria externa    : ${proceso.externo}`,
    '',
    '============================================================',
    ' Reporte generado automáticamente por el servidor de turnos.',
    '============================================================',
  ];

  const contenido = lineas.join('\n');
  const reportPath = path.join(__dirname, '..', '..', 'report.txt');
  fs.writeFileSync(reportPath, contenido, 'utf-8');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="report.txt"');
  res.send(contenido);
};
