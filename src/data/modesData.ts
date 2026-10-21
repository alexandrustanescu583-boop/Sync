import { AssistantMode } from '../types';

export const ASSISTANT_MODES: AssistantMode[] = [
  {
    id: 'general',
    name: 'Tw General',
    shortDesc: 'Asistent inteligent și ultra-rapid',
    badge: 'Standard',
    starterSuggestions: [
      {
        title: 'Cum funcționează stelele?',
        prompt: 'Explică-mi într-un mod fascinant și simplu cum se nasc și strălucesc stelele în univers.',
        icon: 'Sparkles',
      },
      {
        title: 'De ce este cerul albastru?',
        prompt: 'De ce cerul este albastru ziua și roșiatic la apus? Explică fenomenul fizic simplu.',
        icon: 'Sun',
      },
      {
        title: 'Idei de activități educative',
        prompt: 'Dă-mi 5 idei de experimente științifice sau activități creative pe care le pot face acasă.',
        icon: 'Compass',
      },
      {
        title: 'Cum funcționează creierul uman?',
        prompt: 'Cum funcționează neuronii și memoria în creierul uman? Oferă o analogie simplă.',
        icon: 'Brain',
      },
    ],
  },
  {
    id: 'search',
    name: 'Tw Căutare Web Live',
    shortDesc: 'Informații în timp real cu Google Search',
    badge: 'Google Search',
    starterSuggestions: [
      {
        title: 'Ultimele noutăți în știință',
        prompt: 'Care sunt cele mai recente descoperiri științifice și spațiale din această săptămână?',
        icon: 'Globe',
      },
      {
        title: 'Misiuni spațiale actuale',
        prompt: 'Care sunt misiunile active ale NASA și ESA pe Lună și Marte în prezent?',
        icon: 'Compass',
      },
      {
        title: 'Evenimente istorice de astăzi',
        prompt: 'Ce s-a întâmplat important în istorie în ziua de astăzi la nivel mondial?',
        icon: 'Clock',
      },
      {
        title: 'Ghid practic de călătorie',
        prompt: 'Care sunt cele mai spectaculoase castele și trasee montane din România?',
        icon: 'Compass',
      },
    ],
  },
  {
    id: 'homework',
    name: 'Tutor Teme & Școală',
    shortDesc: 'Explicații pas cu pas pentru materii școlare',
    badge: 'Educație',
    starterSuggestions: [
      {
        title: 'Metoda pas cu pas la matematică',
        prompt: 'Am nevoie de ajutor să înțeleg cum se rezolvă ecuațiile de gradul 1 și 2 pas cu pas.',
        icon: 'Calculator',
      },
      {
        title: 'Fotosinteza explicată clar',
        prompt: 'Explică fotosinteza și ciclul oxigenului în natură pe înțelesul unui elev de gimnaziu.',
        icon: 'Leaf',
      },
      {
        title: 'Figuri de stil în limba română',
        prompt: 'Care sunt principalele figuri de stil (metafora, epitetul, personificarea) și dă exemple clare?',
        icon: 'BookOpen',
      },
      {
        title: 'De ce se schimbă anotimpurile?',
        prompt: 'Explică de ce avem 4 anotimpuri pe Pământ și ce rol are înclinația axei terestre.',
        icon: 'Globe',
      },
    ],
  },
  {
    id: 'creative',
    name: 'Povești & Creativitate',
    shortDesc: 'Compuneri, eseuri și povești captivante',
    badge: 'Creație',
    starterSuggestions: [
      {
        title: 'Poveste sci-fi pentru copii',
        prompt: 'Scrie o poveste educativă și captivantă despre un copil care călătorește pe o cometă.',
        icon: 'Rocket',
      },
      {
        title: 'Plan de compunere școlară',
        prompt: 'Ajută-mă cu o introducere, cuprins și încheiere originale pentru o compunere despre o zi de toamnă.',
        icon: 'PenTool',
      },
      {
        title: 'Poezie amuzantă despre știință',
        prompt: 'Scrie o poezie ritmată și plină de umor despre exploratori și atomi.',
        icon: 'Smile',
      },
      {
        title: 'Ghid de scriere creativă',
        prompt: 'Cum creez un personaj memorabil pentru o poveste? Dă-mi 4 sfaturi practice.',
        icon: 'Lightbulb',
      },
    ],
  },
  {
    id: 'code',
    name: 'Programare & Informatică',
    shortDesc: 'Python, JavaScript, Scratch și logică',
    badge: 'Tehnologie',
    starterSuggestions: [
      {
        title: 'Primul program în Python',
        prompt: 'Explică-mi cum scriu primul meu program în Python și cum funcționează funcția print() și variabilele.',
        icon: 'Code',
      },
      {
        title: 'Joc simplu de ghicit numere',
        prompt: 'Scrie un joc simplu în Python în care computerul alege un număr secret între 1 și 100 și jucătorul îl ghicește.',
        icon: 'Terminal',
      },
      {
        title: 'Cum funcționează un site web?',
        prompt: 'Care este diferența dintre HTML, CSS și JavaScript? Oferă o analogie vizuală clară.',
        icon: 'Cpu',
      },
      {
        title: 'Algoritmi și gândire logică',
        prompt: 'Ce este un algoritm și cum funcționează căutarea binară? Explică cu un exemplu din viața reală.',
        icon: 'Braces',
      },
    ],
  },
  {
    id: 'game3d',
    name: 'Joc 3D Arcade (Tw Odyssey)',
    shortDesc: 'Lansează jocul 3D interactiv în timp real',
    badge: '3D Game',
    starterSuggestions: [
      {
        title: 'Pornește jocul 3D',
        prompt: 'Vreau să joc Tw 3D Odyssey acum! Deschide simulatorul.',
        icon: 'Gamepad2',
      },
      {
        title: 'Cum controlez nava?',
        prompt: 'Explică-mi comenzile pentru jocul 3D (săgeți, WASD, touch screen).',
        icon: 'Sparkles',
      },
    ],
  },
];
