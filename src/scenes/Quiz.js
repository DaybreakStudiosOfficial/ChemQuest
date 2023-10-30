import Phaser from 'phaser'
import Player from '../classes/player'
import { auth, database } from '../components/configFirebase'
import { collection, getDocs, updateDoc, doc, getDoc, increment, arrayUnion } from 'firebase/firestore'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

class Quiz extends Phaser.Scene {
    constructor() {
        super({ key: 'Quiz' })
    }
    preload() {
        this.load.spritesheet('buttons', 'assets/util/buttons.png', {
            frameWidth: 11,
            frameHeight: 11
        })
        this.load.spritesheet('energy', '/assets/energy.png', {
            frameWidth: 9,
            frameHeight: 9
        })
        this.load.audio('quizMusic', ['/musicSound/quizMusic.mp3'])
    }
    async create() {
        var music = this.sound.add('quizMusic', {
            loop: true
        })
        const marker = {
            name: '',
            start: 0,
            duration: music.duration,
            config: {
                mute: false,
                loop: false,
                delay: 2000
            }
        }
        music.addMarker(marker)
        music.play(marker)
        var userID = localStorage.getItem('userID')
        var allQuestions = new Map([
            ['acids-and-bases', [{
                ID: 'question1',
                TOPIC: 'acids-and-bases',
                SUBTOPIC: 'buffers',
                QUESTION: 'Which of the following mixture is an example of a buffer solution?',
                ANSWERS: ['NaNO2 and HNO2', 'KCl and HCl', 'NH4NO3 and HNO3', 'NaCl and NaOH'],
                ANSWER: 'NaNO2 and HNO2'
            }, {
                ID: 'question2',
                TOPIC: 'acids-and-bases',
                SUBTOPIC: 'buffers',
                QUESTION: 'Which of the following mixture is not an example of an acidic buffer solution?',
                ANSWERS: ['Na2CO3 and H2CO3', 'CH3COONa and CH3COOH', 'NaClO4 and HClO4', 'Na3PO4 and H3PO4'],
                ANSWER: 'NaClO4 and HClO4'
            }, {
                ID: 'question1',
                TOPIC: 'acids-and-bases',
                SUBTOPIC: 'common-acids-and-bases',
                QUESTION: 'What is the formula for hydrofluoric acid?',
                ANSWERS: ['HCl', 'H2F', 'HF', 'HF2'],
                ANSWER: 'HF'
            }, {
                ID: 'question2',
                TOPIC: 'acids-and-bases',
                SUBTOPIC: 'common-acids-and-bases',
                QUESTION: 'What is the formula for sulfurous acid?',
                ANSWERS: ['H2SO4', 'H2S03', 'H2SO', 'SO3'],
                ANSWER: 'H2SO3'
            }, {
                ID: 'question1',
                TOPIC: 'acids-and-bases',
                SUBTOPIC: 'henderson-hasselbalch-equation',
                QUESTION: 'What is the purpose of the Henderson-Hasselbalch Equation?',
                ANSWERS: ['Determine the moles of solution.', 'Determine the pH of a buffer.', 'Determine the atoms in solution.', 'Determine the atomic weight of silver.'],
                ANSWER: 'Determine the pH of a buffer.'
            }, {
                ID: 'question1',
                TOPIC: 'acids-and-bases',
                SUBTOPIC: 'salt-formation',
                QUESTION: 'What forms as a result of a neutralization reaction?',
                ANSWERS: ['Water and a salt.', 'Water and NaCl.', 'Hydroxide and water.', 'Aluminum and a salt.'],
                ANSWER: 'Water and a salt.'
            }, {
                ID: 'question1',
                TOPIC: 'acids-and-bases',
                SUBTOPIC: 'titration',
                QUESTION: 'An acid-base titration is an experimental technique used to acquire information about:',
                ANSWERS: ['A solution containing an acid or base.', 'A solution containing a neutral substance.', 'A solution containing an ionic compound.', 'None of the above.'],
                ANSWER: 'A solution containing an acid or base.'
            }, {
                ID: 'question2',
                TOPIC: 'acids-and-bases',
                SUBTOPIC: 'titration',
                QUESTION: 'Aqueous solution of the detergents are:',
                ANSWERS: ['Neutral', 'Acidic', 'Basic', 'Amphoteric'],
                ANSWER: 'Basic'
            }]],
            ['atomic-and-electronic-structure', [{
                ID: 'question1',
                TOPIC: 'atomic-and-electronic-structure',
                SUBTOPIC: 'aufbau-principle',
                QUESTION: 'As per the aufbau principle, which of the following orbitals have the greatest energy?',
                ANSWERS: ['3p', '4s', '3d', '3s'],
                ANSWER: '3d'
            }, {
                ID: 'question2',
                TOPIC: 'atomic-and-electronic-structure',
                SUBTOPIC: 'aufbau-principle',
                QUESTION: 'As per the aufbau principle, which of the following orbitals have the lowest energy?',
                ANSWERS: ['1s', '2s', '2p', '3s'],
                ANSWER: '1s'
            }, {
                ID: 'question1',
                TOPIC: 'atomic-and-electronic-structure',
                SUBTOPIC: 'electron-configuration',
                QUESTION: 'What is number of shells used for the electrons in an atom?',
                ANSWERS: ['1', '2', '3', '4'],
                ANSWER: '4'
            }, {
                ID: 'question1',
                TOPIC: 'atomic-and-electronic-structure',
                SUBTOPIC: 'electron-orbitals-and-quantum-numbers',
                QUESTION: 'The principal quantum number of an electron represents:',
                ANSWERS: ['Size of the orbital.', 'Spin angular momentum.', 'Orbital angular momentum.', 'Space orientation of the orbital.'],
                ANSWER: 'Size of the orbital.'
            }, {
                ID: 'question2',
                TOPIC: 'atomic-and-electronic-structure',
                SUBTOPIC: 'electron-orbitals-and-quantum-numbers',
                QUESTION: 'The orientation of electron orbit is determined by:',
                ANSWERS: ['n', 'l', 'm', 's'],
                ANSWER: 'm'
            }, {
                ID: 'question1',
                TOPIC: 'atomic-and-electronic-structure',
                SUBTOPIC: 'valence-electrons',
                QUESTION: 'A valence electron can either absorb or release energy in the form of a:',
                ANSWERS: ['lgiht', 'photon', 'nucleus', 'electron'],
                ANSWER: 'photon'
            }, {
                ID: 'question2',
                TOPIC: 'atomic-and-electronic-structure',
                SUBTOPIC: 'valence-electrons',
                QUESTION: 'The combining capacity of an atom is known as its:',
                ANSWERS: ['valency', 'valence electrons', 'atomic number', 'mass number'],
                ANSWER: 'valency'
            }, {
                ID: 'question3',
                TOPIC: 'atomic-and-electronic-structure',
                SUBTOPIC: 'valence-electrons',
                QUESTION: 'Which of the following have completely filled outermost shell?',
                ANSWERS: ['Metals', 'Non-metals', 'Halogens', 'Noble gases'],
                ANSWER: 'Noble gases'
            }]],
            ['atoms-and-molecules', [{
                ID: 'question1',
                TOPIC: 'atoms-and-molecules',
                SUBTOPIC: 'atom-basics',
                QUESTION: 'What are the three parts of an atom?',
                ANSWERS: ['Protons, photons, neutrons', 'Protons, neutrons, electrons', 'Neutrons, electrons, kryptons', 'Ultrons, megatrons, electrons'],
                ANSWER: 'Protons, neutrons, electrons'
            }, {
                ID: 'question2',
                TOPIC: 'atoms-and-molecules',
                SUBTOPIC: 'atom-basics',
                QUESTION: 'An element is determined by the number of:',
                ANSWERS: ['Atoms', 'Electrons', 'Neutrons', 'Protons'],
                ANSWER: 'Protons'
            }, {
                ID: 'question1',
                TOPIC: 'atoms-and-molecules',
                SUBTOPIC: 'atomic-mass-and-atomic-number',
                QUESTION: 'What is the mass number?',
                ANSWERS: ['Number of protons', 'Number of protons and neutrons', 'Number of neutrons', 'Number of electrons'],
                ANSWER: 'Number of protons and neutrons'
            }, {
                ID: 'question2',
                TOPIC: 'atoms-and-molecules',
                SUBTOPIC: 'atomic-mass-and-atomic-number',
                QUESTION: 'Which particle creates isotopes for an element?',
                ANSWERS: ['Protons', 'Neutrons', 'Electrons', 'Photons'],
                ANSWER: 'Neutrons'
            }, {
                ID: 'question1',
                TOPIC: 'atoms-and-molecules',
                SUBTOPIC: 'ionic-and-covalent-bonds',
                QUESTION: 'Covalent bonds are between:',
                ANSWERS: ['Metal and non-metal', 'Non-metal and non-metal', 'Metal and metal', 'None of the above'],
                ANSWER: 'Non-metal and non-metal'
            }, {
                ID: 'question2',
                TOPIC: 'atoms-and-molecules',
                SUBTOPIC: 'ionic-and-covalent-bonds',
                QUESTION: 'Why do elements form bonds?',
                ANSWERS: ['To become friends', 'To create new elements', 'To become stable', 'None of the above'],
                ANSWER: 'To become stable'
            }, {
                ID: 'question1',
                TOPIC: 'atoms-and-molecules',
                SUBTOPIC: 'oxidation-numbers',
                QUESTION: 'What is the oxidation number of sulfur in sulphuric acid (H2SO4)?',
                ANSWERS: ['4', '6', '8', '10'],
                ANSWER: '6'
            }, {
                ID: 'question2',
                TOPIC: 'atoms-and-molecules',
                SUBTOPIC: 'oxidation-numbers',
                QUESTION: 'What is the oxidation number of nitrogen in nitric acid (HNO3)?',
                ANSWERS: ['3', '5', '7', '9'],
                ANSWER: '5'
            }]],
            ['chemical-reactions', [{
                ID: 'question1',
                TOPIC: 'chemical-reactions',
                SUBTOPIC: 'chemical-reactions',
                QUESTION: 'Double displacement reactions typically form which product:',
                ANSWERS: ['Gas', 'Liquid', 'Light', 'Precipitate'],
                ANSWER: 'Precipitate'
            }, {
                ID: 'question2',
                TOPIC: 'chemical-reactions',
                SUBTOPIC: 'chemical-reactions',
                QUESTION: 'In a single displacement reaction, which atom is swapped?',
                ANSWERS: ['Molecules', 'Electrons', 'Ions', 'Protons'],
                ANSWER: 'Ions'
            }, {
                ID: 'question1',
                TOPIC: 'chemical-reactions',
                SUBTOPIC: 'reactions-in-water',
                QUESTION: 'Most reactions can be characterized as:',
                ANSWERS: ['Double displacement', 'Decomposition', 'Redox', 'Acid-base'],
                ANSWER: 'Redox'
            }, {
                ID: 'question2',
                TOPIC: 'chemical-reactions',
                SUBTOPIC: 'reactions-in-water',
                QUESTION: 'What forms water in an acid-base reaction?',
                ANSWERS: ['H2 and OH-', 'H+ and OH-', 'H2O and H+', 'H+ and O2'],
                ANSWER: 'H+ and OH-'
            }]],
            ['gases', [{
                ID: 'question1',
                TOPIC: 'gases',
                SUBTOPIC: "boyle's-law",
                QUESTION: "Boyle's law provides a relationship between:",
                ANSWERS: ['Temperature and pressure', 'Volume and moles', 'Volume and pressure', 'Volume and temperature'],
                ANSWER: 'Volume and pressure'
            }, {
                ID: 'question2',
                TOPIC: 'gases',
                SUBTOPIC: "boyle's-law",
                QUESTION: 'The volume and pressure associated with the gas are:',
                ANSWERS: ['Equal', 'Directly proportional', 'Inversely proportional', 'None of the above'],
                ANSWER: 'Inversely proportional'
            }, {
                ID: 'question1',
                TOPIC: 'gases',
                SUBTOPIC: "charles'-law",
                QUESTION: "What remains constant when Charles' law is applied to a gas?",
                ANSWERS: ['Pressure', 'Volume', 'Temperature', 'Temperature and moles of gas'],
                ANSWER: 'Pressure'
            }, {
                ID: 'question2',
                TOPIC: 'gases',
                SUBTOPIC: "charles'-law",
                QUESTION: 'What happens to the volume of gas if its temperature is increased?',
                ANSWERS: ['Decreases', 'Increases', 'No change', 'Becomes zero'],
                ANSWER: 'Increases'
            }, {
                ID: 'question1',
                TOPIC: 'gases',
                SUBTOPIC: "dalton's-law-of-partial-pressures",
                QUESTION: "To which of the following is Dalton's law not applicable?",
                ANSWERS: ['H2 and He', 'NH3 and HCl', 'N2 and H2', 'N2 and O2'],
                ANSWER: 'NH3 and HCl'
            }, {
                ID: 'question2',
                TOPIC: 'gases',
                SUBTOPIC: "dalton's-law-of-partial-pressures",
                QUESTION: 'The total pressure of a mixture of ideal gases is equal to:',
                ANSWERS: ['The difference of the partial pressures', 'The product of the partial pressures', 'The sum of the partial pressures', 'None of the above'],
                ANSWER: 'The sum of the partial pressures'
            }, {
                ID: 'question1',
                TOPIC: 'gases',
                SUBTOPIC: 'ideal-gases',
                QUESTION: 'What is the compressibility factor of an ideal gas?',
                ANSWERS: ['1', '0', 'Infinite', 'Depends on the pressure and volume'],
                ANSWER: '1'
            }, {
                ID: 'question2',
                TOPIC: 'gases',
                SUBTOPIC: 'ideal-gases',
                QUESTION: 'What is the shape of P-T curve for an ideal gas?',
                ANSWERS: ['Parabolic', 'Hyperbolic', 'Elliptical', 'Straight line'],
                ANSWER: 'Straight line'
            }]],
            ['kinetics', [{
                ID: 'question1',
                TOPIC: 'kinetics',
                SUBTOPIC: 'reaction-rate',
                QUESTION: 'In a first order reaction, doubling the reactant concentration will:',
                ANSWERS: ['Nullify the reaction rate', 'Double the reaction rate', 'Half the reaction rate', 'None of the above'],
                ANSWER: 'Double the reaction rate'
            }, {
                ID: 'question2',
                TOPIC: 'kinetics',
                SUBTOPIC: 'reaction-rate',
                QUESTION: '',
                ANSWERS: [''],
                ANSWER: ''
            }, {
                ID: 'question1',
                TOPIC: 'kinetics',
                SUBTOPIC: 'chemical-reaction-order',
                QUESTION: 'When the rate of the reaction is equal to the rate constant, the order is:',
                ANSWERS: ['Zero order', 'First order', 'Second order', 'Third order'],
                ANSWER: 'Zero order'
            }, {
                ID: 'question2',
                TOPIC: 'kinetics',
                SUBTOPIC: 'chemical-reaction-order',
                QUESTION: 'For a zero order reaction, the rate of reaction is independent of',
                ANSWERS: ['Temperature', 'Nature of reactions', 'Concentration of reactants', 'Effect of catalyst'],
                ANSWER: 'Concentration of reactants'
            }]],
            ['math-basics', [{
                ID: 'question1',
                TOPIC: 'math-basics',
                SUBTOPIC: 'metric-prefixes',
                QUESTION: 'Which lists metric units, in order, from smallest to largest?',
                ANSWERS: ['kilogram, hectogram, decagram', 'kilogram, gram, centigram', 'decagram, hectogram, milligram', 'milligram, centigram, gram'],
                ANSWER: 'milligram, centigram, gram'
            }, {
                ID: 'question2',
                TOPIC: 'math-basics',
                SUBTOPIC: 'metric-prefixes',
                QUESTION: 'What is the SI base unit for volume?',
                ANSWERS: ['gram', 'meter', 'liter', 'foot'],
                ANSWER: 'liter'
            }, {
                ID: 'question3',
                TOPIC: 'math-basics',
                SUBTOPIC: 'metric-prefixes',
                QUESTION: 'When measuring the length of a paperclip, you would use what SI units?',
                ANSWERS: ['millimeters', 'kilometers', 'grams', 'meters'],
                ANSWER: 'millimeters'
            }, {
                ID: 'question4',
                TOPIC: 'math-basics',
                SUBTOPIC: 'metric-prefixes',
                QUESTION: 'The prefix "giga" means:',
                ANSWERS: ['1 x 10^3', '1 x 10^9', '1 x 10^6', '1 x 10^2'],
                ANSWER: '1 x 10^9'
            }, {
                ID: 'question5',
                TOPIC: 'math-basics',
                SUBTOPIC: 'metric-prefixes',
                QUESTION: 'The prefix "mega" means:',
                ANSWERS: ['1 x 10^6', '1 x 10^9', '1 x 10^3', '1 x 10^2'],
                ANSWER: '1 x 10^6'
            }, {
                ID: 'question1',
                TOPIC: 'math-basics',
                SUBTOPIC: 'physical-constants',
                QUESTION: "What is Avogadro's number?",
                ANSWERS: ['6.022 x 10^23', '9.8 m/s^2', '8.314 J mol^-1 K^-1', '0.529 x 10^-10 m'],
                ANSWER: '6.022 x 10^23'
            }, {
                ID: 'question2',
                TOPIC: 'math-basics',
                SUBTOPIC: 'physical-constants',
                QUESTION: 'What is the gas constant?',
                ANSWERS: ['9.8 m/s^2', '8.314 J mol^-1 K^-1', '6.022 x 10^23', '0.529 x 10^-10 m'],
                ANSWER: '8.314 J mol^-1 K^-1'
            }, {
                ID: 'question3',
                TOPIC: 'math-basics',
                SUBTOPIC: 'physical-constants',
                QUESTION: "What is Planck's constant?",
                ANSWERS: ['6.626 x 10^-34 J s', '1.0014', '2.818 x 10^-15 m', '8.187 x 10^-14 J'],
                ANSWER: '6.626 x 10^-34 J s'
            }, {
                ID: 'question4',
                TOPIC: 'math-basics',
                SUBTOPIC: 'physical-constants',
                QUESTION: "What is Faraday's constant?",
                ANSWERS: ['1.503 x 10^-10 J', '9.649 x 10^4 C mol^-1', '7.297 x 10^-3', '9.8 m s^-2'],
                ANSWER: '9.649 x 10^4 C mol^-1'
            }, {
                ID: 'question5',
                TOPIC: 'math-basics',
                SUBTOPIC: 'physical-constants',
                QUESTION: 'What is the speed of light in a vacuum?',
                ANSWERS: ['2.9979 x 10^8 m/s', '1836.15', '938.272 MeV', '7.297 x 10^-3'],
                ANSWER: '2.9979 x 10^8 m/s'
            }, {
                ID: 'question1',
                TOPIC: 'math-basics',
                SUBTOPIC: 'scientific-notation',
                QUESTION: 'What is 46.3 x 10^4 in scientific notation?',
                ANSWERS: ['4.63 x 10^4', '46.3 x 10^5', '4.63 x 10^5', 'It is already in scientific notation.'],
                ANSWER: '4.63 x 10^5'
            }, {
                ID: 'question1',
                TOPIC: 'math-basics',
                SUBTOPIC: 'significant-figures',
                QUESTION: 'How many sig figs are in 6.9933?',
                ANSWERS: ['2 sig figs', '3 sig figs', '4 sig figs', '5 sig figs'],
                ANSWER: '5 sig figs'
            }, {
                ID: 'question2',
                TOPIC: 'math-basics',
                SUBTOPIC: 'significant-figures',
                QUESTION: 'How many sig figs are in the answer to 0.005 + 60?',
                ANSWERS: ['1 sig fig', '2 sig figs', '3 sig figs', '4 sig figs'],
                ANSWER: '1 sig fig'
            }, , {
                ID: 'question3',
                TOPIC: 'math-basics',
                SUBTOPIC: 'significant-figures',
                QUESTION: 'How many sig figs are in the answer to 44300000 / 0.0024?',
                ANSWERS: ['2 sig figs', '3 sig figs', '4 sig figs', '5 sig figs'],
                ANSWER: '2 sig figs'
            }, {
                ID: 'question4',
                TOPIC: 'math-basics',
                SUBTOPIC: 'significant-figures',
                QUESTION: 'How many sig figs are in 1100000?',
                ANSWERS: ['2 sig figs', '3 sig figs', '4 sig figs', '5 sig figs'],
                ANSWER: '2 sig figs'
            }, {
                ID: 'question1',
                TOPIC: 'math-basics',
                SUBTOPIC: 'temperature-conversions',
                QUESTION: 'Aluminum metal melts at 660.37 C. What is the temperature in Kelvin?',
                ANSWERS: ['923.52', '387.22', '933.52', '377.22'],
                ANSWER: '933.52'
            }, {
                ID: 'question2',
                TOPIC: 'math-basics',
                SUBTOPIC: 'temperature-conversions',
                QUESTION: 'Gallium is a metal that can melt in your hand at 302.93 K. What is the temperature in Celsius?',
                ANSWERS: ['29.78', '27.78', '152.93', '16.85'],
                ANSWER: '29.78'
            }]],
            ['nuclear-chemistry', [{
                ID: 'question1',
                TOPIC: 'nuclear-chemistry',
                SUBTOPIC: 'atomic-abundance',
                QUESTION: 'Cl has the isotopes Cl-37 and Cl-45. Determine the ratio of Cl-37 to Cl-35 based on its atomic mass.',
                ANSWERS: ['1:2', '1:1', '1:3', '3:1'],
                ANSWER: '1:3'
            }, {
                ID: 'question2',
                TOPIC: 'nuclear-chemistry',
                SUBTOPIC: 'atomic-abundance',
                QUESTION: 'Cu has the isotopes Cu-63 and Cu-65. Determine the natural abundance of the Cu-63 isotope.',
                ANSWERS: ['10%', '30%', '50%', '70%'],
                ANSWER: '70%'
            }, {
                ID: 'question1',
                TOPIC: 'nuclear-chemistry',
                SUBTOPIC: 'isotopes-and-nuclear-symbols',
                QUESTION: 'How many neutrons are in the isotope of barium: Ba-137?',
                ANSWERS: ['56 neutrons', '81 neutrons', '137 neutrons', '193 neutrons'],
                ANSWER: '81 neutrons'
            }, {
                ID: 'question2',
                TOPIC: 'nuclear-chemistry',
                SUBTOPIC: 'isotopes-and-nuclear-symbols',
                QUESTION: 'How many neutrons are in the isotope of zinc: Zn-65?',
                ANSWERS: ['30 neutrons', '35 neutrons', '65 neutrons', '95 neutrons'],
                ANSWER: '35 neutrons'
            }, {
                ID: 'question1',
                TOPIC: 'nuclear-chemistry',
                SUBTOPIC: 'radioactive-decay',
                QUESTION: 'The process of isotope transforming into an element of a stable nucleus is:',
                ANSWERS: ['Transverse effect', 'Transumation', 'Mutation', 'None of the above'],
                ANSWER: 'Transmutation'
            }, {
                ID: 'question2',
                TOPIC: 'nuclear-chemistry',
                SUBTOPIC: 'radioactive-decay',
                QUESTION: 'Types of radioactive decay include:',
                ANSWERS: ['Alpha', 'Beta', 'Gamma', 'All of the above'],
                ANSWER: 'All of the above'
            }]],
            ['periodic-trends', [{
                ID: 'question1',
                TOPIC: 'periodic-trends',
                SUBTOPIC: 'element-groups',
                QUESTION: 'What gas is created when group 1 elements react with water?',
                ANSWERS: ['Chlorine gas', 'Water vapor', 'Hydrogen gas', 'Carbon dioxide gas'],
                ANSWER: 'Hydrogen gas'
            }, {
                ID: 'question2',
                TOPIC: 'periodic-trends',
                SUBTOPIC: 'element-groups',
                QUESTION: 'The reactivity of group 1 elements increases down because:',
                ANSWERS: ['It becomes easier to lose electrons', 'It becomes harder to lose electrons', 'It becomes easier to gain electrons', 'It becomes harder to gain electrons'],
                ANSWER: 'It becomes easier to lose electrons'
            }, {
                ID: 'question1',
                TOPIC: 'periodic-trends',
                SUBTOPIC: 'periodic-properties-and-trends',
                QUESTION: 'Group 1 elements react with non-metals forming which of the following bonds:',
                ANSWERS: ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'],
                ANSWER: 'Hydrogen'
            }, {
                ID: 'question2',
                TOPIC: 'periodic-trends',
                SUBTOPIC: 'periodic-properties-and-trends',
                QUESTION: 'Which of the following is not a property of group 1 metals?',
                ANSWERS: ['Shiny when cut', 'Low density', 'Very hard', 'Low melting point'],
                ANSWER: 'Very hard'
            }]],
            ['solutions', [{
                ID: 'question1',
                TOPIC: 'solutions',
                SUBTOPICS: 'calculating-concentration',
                QUESTION: '480 mL of a 1.5 M solution is mixed with 520 mL of a 1.2 M second solution. What is the molarity of the final mixture?',
                ANSWERS: ['1.20 M', '1.34 M', '1.50 M', '2.70 M'],
                ANSWER: '1.34 M'
            }, {
                ID: 'question2',
                TOPIC: 'solutions',
                SUBTOPICS: 'calculating-concentration',
                QUESTION: '25 mL of a solution of Ba(OH)2 on titration with 0.1 M of HCl gave titer value of 35 mL. The molarity of Ba(OH)2 solution was:',
                ANSWERS: ['0.07 M', '0.14 M', '0.28 M', '0.35 M'],
                ANSWER: '0.07 M'
            }, {
                ID: 'question1',
                TOPIC: 'solutions',
                SUBTOPICS: 'types-of-mixtures',
                QUESTION: 'Which of the following substances are uniform throughout?',
                ANSWERS: ['Heterogeneous mixture', 'Homogeneous mixture', 'Pure substance', 'None of the above'],
                ANSWER: 'Homogeneous mixture'
            }, {
                ID: 'question2',
                TOPIC: 'solutions',
                SUBTOPICS: 'types-of-mixtures',
                QUESTION: 'Which of the following substances can be physically separated?',
                ANSWERS: ['Mixture', 'Element', 'Compound', 'Atom'],
                ANSWER: 'Mixture'
            }]],
            ['states-of-matter', [{
                ID: 'question1',
                TOPIC: 'states-of-matter',
                SUBTOPIC: 'phase-diagrams',
                QUESTION: 'The phase diagram of water has how many components?',
                ANSWERS: ['1', '2', '3', '4'],
                ANSWER: '1'
            }, {
                ID: 'question2',
                TOPIC: 'states-of-matter',
                SUBTOPIC: 'phase-diagrams',
                QUESTION: 'At what point do three phases of a substance coexist?',
                ANSWERS: ['Critical point', 'Triple point', 'High point', 'None of the above'],
                ANSWER: 'Triple point'
            }, {
                ID: 'question1',
                TOPIC: 'states-of-matter',
                SUBTOPIC: 'states-of-matter',
                QUESTION: 'Liquid to gas conversion is:',
                ANSWERS: ['Sublimation', 'Deposition', 'Vaporization', 'Condensation'],
                ANSWER: 'Vaporization'
            }, {
                ID: 'question2',
                TOPIC: 'states-of-matter',
                SUBTOPIC: 'states-of-matter',
                QUESTION: 'Strong intermolecular forces exist in:',
                ANSWERS: ['Gases', 'Liquids', 'Amorphous solids', 'Crystalline solids'],
                ANSWER: 'Crystalline solids'
            }]],
            ['stoichiometry', [{
                ID: 'question1',
                TOPIC: 'stoichiometry',
                SUBTOPIC: 'balance-equations',
                QUESTION: 'Determine X in 4Al + 3O2 = XAl2O3',
                ANSWERS: ['2', '3', '4', '5'],
                ANSWER: '2'
            }, {
                ID: 'question2',
                TOPIC: 'stoichiometry',
                SUBTOPIC: 'balance-equations',
                QUESTION: 'Determine X in CH4 + XO2 = CO2 + 2H2O',
                ANSWERS: ['2', '3', '4', '5'],
                ANSWER: '2'
            }, {
                ID: 'question1',
                TOPIC: 'stoichiometry',
                SUBTOPIC: 'balance-redox-reactions',
                QUESTION: 'Balance the reaction in acidic solution: Ag + HNO3 = AgNO3 + NO2 + H2O',
                ANSWERS: ['Ag + 2HNO3 = AgNO3 + NO2 + H2O', 'Ag + 2HNO3 = AgNO3 + 2NO2 + H2O', '3Ag + HNO3 = AgNO3 + NO2 + 4H2O', 'None of the above'],
                ANSWER: 'Ag + 2HNO3 = AgNO3 + NO2 + H2O'
            }, {
                ID: 'question2',
                TOPIC: 'stoichiometry',
                SUBTOPIC: 'balance-redox-reactions',
                QUESTION: 'Balance the reaction in acidic solution: NO3- + I2 = IO3- + NO2',
                ANSWERS: ['10NO3- + I2 + 8H+ = 4IO3- + 5NO2 + 8H2O', '10NO3- + I2 + 8H+ = 2IO3- + 10NO2 + 4H2O', '5NO3- + I2 + 4H+ = IO3- + 5NO2 + 2H2O', 'None of the above'],
                ANSWER: '10NO3- + I2 + 8H+ = 2IO3- + 10NO2 + 4H2O'
            }, {
                ID: 'question1',
                TOPIC: 'stoichiometry',
                SUBTOPIC: 'gram-to-mole-conversions',
                QUESTION: 'How many grams are in 2 moles of CO2?',
                ANSWERS: ['22 g', '28 g', '88 g', '36 g'],
                ANSWER: '88 g'
            }, {
                ID: 'question2',
                TOPIC: 'stoichiometry',
                SUBTOPIC: 'gram-to-mole-conversions',
                QUESTION: 'What is the mass of 2.5 moles of CH4?',
                ANSWERS: ['50 g', '32 g', '40 g', '36 g'],
                ANSWER: '40 g'
            }, {
                ID: 'question1',
                TOPIC: 'stoichiometry',
                SUBTOPIC: 'limiting-reactant-and-theoretical-yield',
                QUESTION: 'The maximum amount of product that can be formed in a reaction is the:',
                ANSWERS: ['Limiting yield', 'Theoretical yield', 'Possible product', 'None of the above'],
                ANSWER: 'Theoretical yield'
            }, {
                ID: 'question2',
                TOPIC: 'stoichiometry',
                SUBTOPIC: 'limiting-reactant-and-theoretical-yield',
                QUESTION: 'Which of the following reasons decrease the actual yield from a reaction?',
                ANSWERS: ['Side reactions', 'Impure starting materials', 'Measurement error', 'All of the above'],
                ANSWER: 'All of the above'
            }]],
            ['thermochemistry-and-physical-chemistry', [{
                ID: 'question1',
                TOPIC: 'thermochemistry-and-physical-chemistry',
                SUBTOPIC: 'bond-energy-and-enthalpy-change',
                QUESTION: 'Estimate the overall enthalpy change for the reaction: 2 H2 + O2 = 2H2O',
                ANSWERS: ['1300 KJ/mol', '1370 KJ/mol', '1230 KJ/mol', '800 KJ/mol'],
                ANSWER: '1370 KJ/mol'
            }, {
                ID: 'question2',
                TOPIC: 'thermochemistry-and-physical-chemistry',
                SUBTOPIC: 'bond-energy-and-enthalpy-change',
                QUESTION: 'Choose the the false statement.',
                ANSWERS: ['Single bonds are more easily broken than double bonds.', 'Double bonds are more easily broken than triple bonds.', 'Triple bonds are more easily broken than double bonds.', 'None of the above'],
                ANSWER: 'Triple bonds are more easily broken than double bonds.'
            }, {
                ID: 'question1',
                TOPIC: 'thermochemistry-and-physical-chemistry',
                SUBTOPIC: 'calorimetry-and-heat-flow',
                QUESTION: 'Which of the following is the mode of heat transfer?',
                ANSWERS: ['Conduction', 'Convection', 'Radiation', 'All of the above'],
                ANSWER: 'All of the above'
            }, {
                ID: 'question2',
                TOPIC: 'thermochemistry-and-physical-chemistry',
                SUBTOPIC: 'calorimetry-and-heat-flow',
                QUESTION: 'When heat is released by the system:',
                ANSWERS: ['An equal amount of heat is absorbed by the surroundings.', 'Heat may either be absorbed or released by the surroundings.', 'The temperature of the system increases.', 'None of the above'],
                ANSWER: 'An equal amount of heat is absorbed by the surroundings.'
            }, {
                ID: 'question1',
                TOPIC: 'thermochemistry-and-physical-chemistry',
                SUBTOPIC: 'endothermic-and-exothermic-reactions',
                QUESTION: 'Photosynthesis is a common example of which kind of reaction?',
                ANSWERS: ['Endothermic', 'Exothermic', 'Decomposition', 'Combination'],
                ANSWER: 'Endothermic'
            }, {
                ID: 'question2',
                TOPIC: 'thermochemistry-and-physical-chemistry',
                SUBTOPIC: 'endothermic-and-exothermic-reactions',
                QUESTION: 'A reaction that releases energy from the system as heat is:',
                ANSWERS: ['Endothermic', 'Exothermic', 'Decomposition', 'Combination'],
                ANSWER: 'Exothermic'
            }, {
                ID: 'question1',
                TOPIC: 'thermochemistry-and-physical-chemistry',
                SUBTOPIC: 'laws-of-thermochemistry',
                QUESTION: 'According to kinetic theory of gases, absolute zero temperature occurs when:',
                ANSWERS: ['Volume of the gas is zero.', 'Pressure of the gas is zero.', 'Kinetic energy of the molecules is zero.', 'Mass is zero.'],
                ANSWER: 'Kinetic energy of the molecules is zero.'
            }, {
                ID: 'question2',
                TOPIC: 'thermochemistry-and-physical-chemistry',
                SUBTOPIC: 'laws-of-thermochemistry',
                QUESTION: 'Which of the following is true for a steady flow system?',
                ANSWERS: ['Mass does not enter or leave the system.', 'Mass entering is equal to the mass leaving.', 'Mass entering is more or less than the mass leaving.', 'None of the above.'],
                ANSWER: 'Mass entering is equal to the mass leaving.'
            }]]
        ])
        var questions = []
        var releasedTopics = []
        var index = 0
        var userType = 'users'
        const tempRef = doc(database, 'students', userID)
        const tempSnap = await getDoc(tempRef)
        if (tempSnap.data()) {
            userType = 'students'
        } else {
            const docRef2 = doc(database, 'educators', userID)
            const docSnap2 = await getDoc(docRef2)
            if (docSnap2.data()) {
                userType = 'educators'
            }
        }
        const docRef = doc(database, userType, userID)
        const docSnap = await getDoc(docRef)
        if (userType == 'students') {
            const classCode = docSnap.data().CLASS
            const querySnapshot = await getDocs(collection(database, 'educators'))
            querySnapshot.forEach((doc) => {
                if (doc.data().CLASS == classCode) {
                    releasedTopics = doc.data().TOPICS
                }
            })
        } else {
            releasedTopics = docSnap.data().TOPICS
        }
        var temp = []
        releasedTopics.forEach((topic) => {
            if (allQuestions.has(topic)) {
                allQuestions.get(topic).forEach((question) => {
                    temp.push(question)
                })
            }
        })
        questions = temp
        this.cameras.main.setBackgroundColor('#08081A')
        const zoom = 4
        var back = this.add.image(50, 50, 'buttons', 0).setScrollFactor(0, 0).setScale(zoom).setInteractive({ cursor: 'pointer' })
        back.on('pointerup', () => {
            music.destroy()
            this.scene.start('Labyrinth')
        })
        var energyBar = this.add.rectangle(this.cameras.main.displayWidth - 150, 50, 100, 32, 0x08081A).setScrollFactor(0, 0)
        energyBar.setOrigin(0, 0.5)
        const styleEnergy = {
            fontSize: '18px',
            color: 'white',
            fontWeight: 'bold',
            fontFamily: 'Calibri'
        }
        var energyText = this.add.text(this.cameras.main.displayWidth - 120, 42, Player.energy, styleEnergy).setScrollFactor(0, 0)
        var energy = this.add.image(this.cameras.main.displayWidth - 150, 50, 'energy').setScrollFactor(0, 0).setScale(zoom)
 
        // get question data
        if (releasedTopics.length > 0) {
            var questionText = questions[index].QUESTION
            var answerTextA = questions[index].ANSWERS[0]
            var answerTextB = questions[index].ANSWERS[1]
            var answerTextC = questions[index].ANSWERS[2]
            var answerTextD = questions[index].ANSWERS[3]
            var correct = questions[index].ANSWER
            const styleAnswers = {
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: 'Calibri',
                textTransform: 'capitalize',
                wordWrap: { width: (this.cameras.main.displayWidth / 2) - 125, useAdvancedWrap: true }
            }
            const styleCorrect = {
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: 'Calibri',
                textTransform: 'capitalize'
            }
            const styleQuestion = {
                fontSize: '28px',
                fontWeight: 'bold',
                fontFamily: 'Calibri',
                textAlign: 'center',
                wordWrap: { width: this.cameras.main.displayWidth - 50, useAdvancedWrap: true }
            }
            console.log(userID)
            // generate graphics
            var answerBoxList = []
            var question = this.add.text(this.cameras.main.displayWidth / 2, 200, questionText, styleQuestion).setScrollFactor(0, 0).setOrigin(0.5, 0)

            var answerWidth = (this.cameras.main.displayWidth / 2) - 75
            var boxA = this.add.rectangle(50, this.cameras.main.displayHeight - 150, answerWidth, 75, 0x4F4789).setScrollFactor(0, 0)
            boxA.setOrigin(0, 1).setInteractive({ cursor: 'pointer' })
            var answerA = this.add.text(75, this.cameras.main.displayHeight - 203, answerTextA, styleAnswers).setScrollFactor(0, 0).setOrigin(0, 0)
            answerBoxList.push([boxA, answerA])

            var boxB = this.add.rectangle((this.cameras.main.displayWidth / 2) + 25, this.cameras.main.displayHeight - 150, answerWidth, 75, 0x4F4789).setScrollFactor(0, 0)
            boxB.setOrigin(0, 1).setInteractive({ cursor: 'pointer' })
            var answerB = this.add.text((this.cameras.main.displayWidth / 2) + 50, this.cameras.main.displayHeight - 203, answerTextB, styleAnswers).setScrollFactor(0, 0).setOrigin(0, 0)
            answerBoxList.push([boxB, answerB])

            var boxC = this.add.rectangle(50, this.cameras.main.displayHeight - 50, answerWidth, 75, 0x4F4789).setScrollFactor(0, 0)
            boxC.setOrigin(0, 1).setInteractive({ cursor: 'pointer' })
            var answerC = this.add.text(75, this.cameras.main.displayHeight - 103, answerTextC, styleAnswers).setScrollFactor(0, 0).setOrigin(0, 0)
            answerBoxList.push([boxC, answerC])

            var boxD = this.add.rectangle((this.cameras.main.displayWidth / 2) + 25, this.cameras.main.displayHeight - 50, answerWidth, 75, 0x4F4789).setScrollFactor(0, 0)
            boxD.setOrigin(0, 1).setInteractive({ cursor: 'pointer' })
            var answerD = this.add.text((this.cameras.main.displayWidth / 2) + 50, this.cameras.main.displayHeight - 103, answerTextD, styleAnswers).setScrollFactor(0, 0).setOrigin(0, 0)
            answerBoxList.push([boxD, answerD])

            var correctAnswer = this.add.text(this.cameras.main.displayWidth / 2, 48, 'Incorrect! Review the problem in Dashboard.', styleCorrect).setScrollFactor(0, 0).setOrigin(0.5, 0)
            correctAnswer.setVisible(false)

            var incorrect = []
            answerBoxList.forEach((answerBox) => {
                answerBox[0].on('pointerdown', function (pointer) {
                    if (correct == answerBox[1].text) {
                        Player.energy = Player.energy + 2
                        energyText.setText(Player.energy)
                        correctAnswer.setVisible(false)
                        if (index >= questions.length) {
                            index = 0
                        }
                        questionText = questions[index].QUESTION
                        question.setText(questionText)
                        answerTextA = questions[index].ANSWERS[0]
                        answerA.setText(answerTextA)
                        answerTextB = questions[index].ANSWERS[1]
                        answerB.setText(answerTextB)
                        answerTextC = questions[index].ANSWERS[2]
                        answerC.setText(answerTextC)
                        answerTextD = questions[index].ANSWERS[3]
                        answerD.setText(answerTextD)
                        correct = questions[index].ANSWER
                        const updateCorrect = async () => {
                            const docRef = doc(database, userType, userID)
                            await updateDoc(docRef, {
                                QRIGHT: increment(1)
                            })
                        }
                        updateCorrect()
                    } else {
                        correctAnswer.setVisible(true)
                        const updateIncorrect = async () => {
                            var ref = '' + questions[index].SUBTOPIC + '.' + questions[index].ID
                            const docRef = doc(database, userType, userID, 'incorrect-questions', questions[index].TOPIC)
                            const docSnap = await getDoc(docRef)
                            if (docSnap.data()[questions[index].SUBTOPIC].hasOwnProperty([questions[index].ID])) {
                                await updateDoc(docRef, {
                                    QWRONG: increment(1),
                                    [ref]: answerBox[1].text
                                })
                            } else {
                                await updateDoc(docRef, {
                                    QWRONG: increment(1),
                                    [questions[index].SUBTOPIC]: {
                                        [questions[index].ID]: answerBox[1].text
                                    }
                                })
                            }
                            const docRef2 = doc(database, userType, userID)
                            await updateDoc(docRef2, {
                                QWRONG: increment(1)
                            })
                        }
                        updateIncorrect()
                    }
                    index = index + 1
                })
            })
        } else {
            const styleAnswers = {
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: 'Calibri',
                textTransform: 'capitalize'
            }
            var correctAnswer = this.add.text(this.cameras.main.displayWidth / 2, 48, 'Oops! Looks like your educator did not release any problems to practce.', styleAnswers).setScrollFactor(0, 0).setOrigin(0.5, 0)
        }
    }
    update() {
    }
}

export default Quiz
