import balisage from './balisage.js';
import ripam from './ripam.js';
import feux from './feux.js';
import signaux from './signaux.js';
import securite from './securite.js';
import bord from './bord.js';
import vhf from './vhf.js';
import meteo from './meteo.js';

export const THEMES = {
  balisage: 'Balisage et carte',
  ripam: 'Règles de barre et de route',
  feux: 'Feux et marques des navires',
  signaux: 'Signaux',
  securite: 'Sécurité et sauvetage',
  bord: 'Chef de bord, scoutisme',
  vhf: 'VHF',
  meteo: 'Météo et marée',
};

// Répartition d'une épreuve blanche de 30 questions, proche de celle des annales
export const EXAM_PLAN = {
  balisage: 7,
  ripam: 5,
  feux: 5,
  signaux: 3,
  securite: 3,
  bord: 2,
  vhf: 3,
  meteo: 2,
};

const tag = (t, list) => list.map((q) => ({ ...q, t }));

export const QUESTIONS = [
  ...tag('balisage', balisage),
  ...tag('ripam', ripam),
  ...tag('feux', feux),
  ...tag('signaux', signaux),
  ...tag('securite', securite),
  ...tag('bord', bord),
  ...tag('vhf', vhf),
  ...tag('meteo', meteo),
];
