let scene, camera, renderer, controls, directionalLight;
let directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);
// TODO: Fix to follow camera orientation
let displacementVector = new THREE.Vector3(), scalingVector = new THREE.Vector3(1, 1, 1), spacingVector = new THREE.Vector3(1, 1, 1);
let musicFile;
let notes = [];

const happyBirthdaySimplifiedJSON = '[{"track": 1, "start": 1.199998, "end": 1.5987473354166668, "pitch": 60, "velocity": 80, "duration": 0.3987493354166669}, {"track": 1, "start": 1.5999973333333333, "end": 1.7987470020833334, "pitch": 60, "velocity": 80, "duration": 0.1987496687500001}, {"track": 1, "start": 1.799997, "end": 2.398746002083333, "pitch": 62, "velocity": 80, "duration": 0.598749002083333}, {"track": 1, "start": 2.399996, "end": 2.998745002083333, "pitch": 60, "velocity": 80, "duration": 0.5987490020833333}, {"track": 1, "start": 2.999995, "end": 3.598744002083333, "pitch": 65, "velocity": 80, "duration": 0.5987490020833328}, {"track": 1, "start": 3.599994, "end": 4.798742002083333, "pitch": 64, "velocity": 80, "duration": 1.1987480020833332}, {"track": 1, "start": 4.799992, "end": 5.198741335416666, "pitch": 60, "velocity": 80, "duration": 0.39874933541666646}, {"track": 1, "start": 5.199991333333333, "end": 5.398741002083333, "pitch": 60, "velocity": 80, "duration": 0.19874966874999966}, {"track": 1, "start": 5.399991, "end": 5.998740002083333, "pitch": 62, "velocity": 80, "duration": 0.5987490020833333}, {"track": 1, "start": 5.99999, "end": 6.598739002083334, "pitch": 60, "velocity": 80, "duration": 0.5987490020833333}, {"track": 1, "start": 6.599989, "end": 7.198738002083333, "pitch": 67, "velocity": 80, "duration": 0.5987490020833333}, {"track": 1, "start": 7.199988, "end": 8.398736002083334, "pitch": 65, "velocity": 80, "duration": 1.1987480020833337}, {"track": 1, "start": 8.399986, "end": 8.798735335416668, "pitch": 60, "velocity": 80, "duration": 0.39874933541666735}, {"track": 1, "start": 8.799985333333334, "end": 8.998735002083333, "pitch": 60, "velocity": 80, "duration": 0.19874966874999878}, {"track": 1, "start": 8.999985, "end": 9.598734002083333, "pitch": 72, "velocity": 80, "duration": 0.5987490020833324}, {"track": 1, "start": 9.599984, "end": 10.198733002083333, "pitch": 69, "velocity": 80, "duration": 0.5987490020833341}, {"track": 1, "start": 10.199983, "end": 10.798732002083334, "pitch": 65, "velocity": 80, "duration": 0.5987490020833341}, {"track": 1, "start": 10.799982, "end": 11.398731002083332, "pitch": 64, "velocity": 80, "duration": 0.5987490020833324}, {"track": 1, "start": 11.399981, "end": 11.998730002083333, "pitch": 62, "velocity": 80, "duration": 0.5987490020833324}, {"track": 1, "start": 11.99998, "end": 12.398729335416666, "pitch": 70, "velocity": 80, "duration": 0.3987493354166656}, {"track": 1, "start": 12.399979333333334, "end": 12.598729002083333, "pitch": 70, "velocity": 80, "duration": 0.19874966874999878}, {"track": 1, "start": 12.599979, "end": 13.198728002083334, "pitch": 69, "velocity": 80, "duration": 0.5987490020833341}, {"track": 1, "start": 13.199978, "end": 13.798727002083334, "pitch": 65, "velocity": 80, "duration": 0.5987490020833341}, {"track": 1, "start": 13.799977, "end": 14.398726002083333, "pitch": 67, "velocity": 80, "duration": 0.5987490020833324}, {"track": 1, "start": 14.399976, "end": 16.198723002083334, "pitch": 65, "velocity": 80, "duration": 1.7987470020833332}]';
const happyBirthdayJSON = '[{"track": 3, "start": 0.0, "end": 0.5987490020833334, "pitch": 60, "velocity": 80, "duration": 0.5987490020833334}, {"track": 3, "start": 0.599999, "end": 1.1987480020833334, "pitch": 59, "velocity": 80, "duration": 0.5987490020833335}, {"track": 1, "start": 1.199998, "end": 1.57874736875, "pitch": 60, "velocity": 80, "duration": 0.3787493687500001}, {"track": 2, "start": 1.199998, "end": 1.57874736875, "pitch": 48, "velocity": 80, "duration": 0.3787493687500001}, {"track": 3, "start": 1.199998, "end": 1.5987473354166668, "pitch": 58, "velocity": 80, "duration": 0.3987493354166669}, {"track": 3, "start": 1.199998, "end": 1.5987473354166668, "pitch": 60, "velocity": 80, "duration": 0.3987493354166669}, {"track": 4, "start": 1.199998, "end": 1.7987470020833334, "pitch": 48, "velocity": 80, "duration": 0.5987490020833335}, {"track": 4, "start": 1.199998, "end": 1.7987470020833334, "pitch": 52, "velocity": 80, "duration": 0.5987490020833335}, {"track": 4, "start": 1.199998, "end": 1.7987470020833334, "pitch": 55, "velocity": 80, "duration": 0.5987490020833335}, {"track": 1, "start": 1.5999973333333333, "end": 1.78874701875, "pitch": 60, "velocity": 80, "duration": 0.1887496854166668}, {"track": 2, "start": 1.5999973333333333, "end": 1.78874701875, "pitch": 48, "velocity": 80, "duration": 0.1887496854166668}, {"track": 3, "start": 1.5999973333333333, "end": 1.7987470020833334, "pitch": 60, "velocity": 80, "duration": 0.1987496687500001}, {"track": 1, "start": 1.799997, "end": 2.3687460520833334, "pitch": 62, "velocity": 80, "duration": 0.5687490520833334}, {"track": 2, "start": 1.799997, "end": 2.3687460520833334, "pitch": 50, "velocity": 80, "duration": 0.5687490520833334}, {"track": 3, "start": 1.799997, "end": 2.398746002083333, "pitch": 62, "velocity": 80, "duration": 0.598749002083333}, {"track": 4, "start": 1.799997, "end": 3.598744002083333, "pitch": 48, "velocity": 80, "duration": 1.798747002083333}, {"track": 4, "start": 1.799997, "end": 3.598744002083333, "pitch": 53, "velocity": 80, "duration": 1.798747002083333}, {"track": 4, "start": 1.799997, "end": 3.598744002083333, "pitch": 57, "velocity": 80, "duration": 1.798747002083333}, {"track": 1, "start": 2.399996, "end": 2.9687450520833334, "pitch": 60, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 2.399996, "end": 2.9687450520833334, "pitch": 48, "velocity": 80, "duration": 0.5687490520833336}, {"track": 3, "start": 2.399996, "end": 2.998745002083333, "pitch": 60, "velocity": 80, "duration": 0.5987490020833333}, {"track": 1, "start": 2.999995, "end": 3.5687440520833333, "pitch": 65, "velocity": 80, "duration": 0.5687490520833332}, {"track": 2, "start": 2.999995, "end": 3.5687440520833333, "pitch": 53, "velocity": 80, "duration": 0.5687490520833332}, {"track": 3, "start": 2.999995, "end": 3.598744002083333, "pitch": 65, "velocity": 80, "duration": 0.5987490020833328}, {"track": 1, "start": 3.599994, "end": 4.738742102083334, "pitch": 64, "velocity": 80, "duration": 1.1387481020833339}, {"track": 2, "start": 3.599994, "end": 4.738742102083334, "pitch": 52, "velocity": 80, "duration": 1.1387481020833339}, {"track": 3, "start": 3.599994, "end": 4.798742002083333, "pitch": 64, "velocity": 80, "duration": 1.1987480020833332}, {"track": 4, "start": 3.599994, "end": 5.398741002083333, "pitch": 48, "velocity": 80, "duration": 1.7987470020833327}, {"track": 4, "start": 3.599994, "end": 5.398741002083333, "pitch": 52, "velocity": 80, "duration": 1.7987470020833327}, {"track": 4, "start": 3.599994, "end": 5.398741002083333, "pitch": 55, "velocity": 80, "duration": 1.7987470020833327}, {"track": 1, "start": 4.799992, "end": 5.178741368750001, "pitch": 60, "velocity": 80, "duration": 0.3787493687500012}, {"track": 2, "start": 4.799992, "end": 5.178741368750001, "pitch": 48, "velocity": 80, "duration": 0.3787493687500012}, {"track": 3, "start": 4.799992, "end": 5.198741335416666, "pitch": 60, "velocity": 80, "duration": 0.39874933541666646}, {"track": 1, "start": 5.199991333333333, "end": 5.38874101875, "pitch": 60, "velocity": 80, "duration": 0.18874968541666703}, {"track": 2, "start": 5.199991333333333, "end": 5.38874101875, "pitch": 48, "velocity": 80, "duration": 0.18874968541666703}, {"track": 3, "start": 5.199991333333333, "end": 5.398741002083333, "pitch": 60, "velocity": 80, "duration": 0.19874966874999966}, {"track": 1, "start": 5.399991, "end": 5.968740052083333, "pitch": 62, "velocity": 80, "duration": 0.5687490520833327}, {"track": 2, "start": 5.399991, "end": 5.968740052083333, "pitch": 60, "velocity": 80, "duration": 0.5687490520833327}, {"track": 3, "start": 5.399991, "end": 5.998740002083333, "pitch": 62, "velocity": 80, "duration": 0.5987490020833333}, {"track": 4, "start": 5.399991, "end": 7.198738002083333, "pitch": 48, "velocity": 80, "duration": 1.7987470020833332}, {"track": 4, "start": 5.399991, "end": 7.198738002083333, "pitch": 52, "velocity": 80, "duration": 1.7987470020833332}, {"track": 4, "start": 5.399991, "end": 7.198738002083333, "pitch": 55, "velocity": 80, "duration": 1.7987470020833332}, {"track": 1, "start": 5.99999, "end": 6.568739052083333, "pitch": 60, "velocity": 80, "duration": 0.5687490520833327}, {"track": 2, "start": 5.99999, "end": 6.568739052083333, "pitch": 59, "velocity": 80, "duration": 0.5687490520833327}, {"track": 3, "start": 5.99999, "end": 6.598739002083334, "pitch": 60, "velocity": 80, "duration": 0.5987490020833333}, {"track": 1, "start": 6.599989, "end": 7.168738052083333, "pitch": 67, "velocity": 80, "duration": 0.5687490520833327}, {"track": 2, "start": 6.599989, "end": 7.168738052083333, "pitch": 58, "velocity": 80, "duration": 0.5687490520833327}, {"track": 3, "start": 6.599989, "end": 7.198738002083333, "pitch": 67, "velocity": 80, "duration": 0.5987490020833333}, {"track": 1, "start": 7.199988, "end": 8.338736102083335, "pitch": 65, "velocity": 80, "duration": 1.1387481020833343}, {"track": 2, "start": 7.199988, "end": 8.338736102083335, "pitch": 57, "velocity": 80, "duration": 1.1387481020833343}, {"track": 3, "start": 7.199988, "end": 8.398736002083334, "pitch": 65, "velocity": 80, "duration": 1.1987480020833337}, {"track": 4, "start": 7.199988, "end": 8.998735002083333, "pitch": 48, "velocity": 80, "duration": 1.7987470020833323}, {"track": 4, "start": 7.199988, "end": 8.998735002083333, "pitch": 53, "velocity": 80, "duration": 1.7987470020833323}, {"track": 4, "start": 7.199988, "end": 8.998735002083333, "pitch": 57, "velocity": 80, "duration": 1.7987470020833323}, {"track": 1, "start": 8.399986, "end": 8.77873536875, "pitch": 60, "velocity": 80, "duration": 0.3787493687500003}, {"track": 1, "start": 8.399986, "end": 8.77873536875, "pitch": 64, "velocity": 80, "duration": 0.3787493687500003}, {"track": 2, "start": 8.399986, "end": 8.77873536875, "pitch": 48, "velocity": 80, "duration": 0.3787493687500003}, {"track": 2, "start": 8.399986, "end": 8.77873536875, "pitch": 55, "velocity": 80, "duration": 0.3787493687500003}, {"track": 3, "start": 8.399986, "end": 8.798735335416668, "pitch": 60, "velocity": 80, "duration": 0.39874933541666735}, {"track": 1, "start": 8.799985333333334, "end": 8.98873501875, "pitch": 60, "velocity": 80, "duration": 0.18874968541666703}, {"track": 1, "start": 8.799985333333334, "end": 8.98873501875, "pitch": 64, "velocity": 80, "duration": 0.18874968541666703}, {"track": 2, "start": 8.799985333333334, "end": 8.98873501875, "pitch": 48, "velocity": 80, "duration": 0.18874968541666703}, {"track": 2, "start": 8.799985333333334, "end": 8.98873501875, "pitch": 55, "velocity": 80, "duration": 0.18874968541666703}, {"track": 3, "start": 8.799985333333334, "end": 8.998735002083333, "pitch": 60, "velocity": 80, "duration": 0.19874966874999878}, {"track": 1, "start": 8.999985, "end": 9.568734052083334, "pitch": 72, "velocity": 80, "duration": 0.5687490520833336}, {"track": 1, "start": 8.999985, "end": 9.568734052083334, "pitch": 77, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 8.999985, "end": 9.568734052083334, "pitch": 53, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 8.999985, "end": 9.568734052083334, "pitch": 57, "velocity": 80, "duration": 0.5687490520833336}, {"track": 3, "start": 8.999985, "end": 9.598734002083333, "pitch": 72, "velocity": 80, "duration": 0.5987490020833324}, {"track": 4, "start": 8.999985, "end": 10.798732002083334, "pitch": 48, "velocity": 80, "duration": 1.7987470020833332}, {"track": 4, "start": 8.999985, "end": 10.798732002083334, "pitch": 53, "velocity": 80, "duration": 1.7987470020833332}, {"track": 4, "start": 8.999985, "end": 10.798732002083334, "pitch": 57, "velocity": 80, "duration": 1.7987470020833332}, {"track": 1, "start": 9.599984, "end": 10.168733052083335, "pitch": 69, "velocity": 80, "duration": 0.5687490520833354}, {"track": 1, "start": 9.599984, "end": 10.168733052083335, "pitch": 72, "velocity": 80, "duration": 0.5687490520833354}, {"track": 2, "start": 9.599984, "end": 10.168733052083335, "pitch": 53, "velocity": 80, "duration": 0.5687490520833354}, {"track": 2, "start": 9.599984, "end": 10.168733052083335, "pitch": 60, "velocity": 80, "duration": 0.5687490520833354}, {"track": 3, "start": 9.599984, "end": 10.198733002083333, "pitch": 69, "velocity": 80, "duration": 0.5987490020833341}, {"track": 1, "start": 10.199983, "end": 10.768732052083333, "pitch": 65, "velocity": 80, "duration": 0.5687490520833336}, {"track": 1, "start": 10.199983, "end": 10.768732052083333, "pitch": 75, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 10.199983, "end": 10.768732052083333, "pitch": 48, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 10.199983, "end": 10.768732052083333, "pitch": 53, "velocity": 80, "duration": 0.5687490520833336}, {"track": 3, "start": 10.199983, "end": 10.798732002083334, "pitch": 65, "velocity": 80, "duration": 0.5987490020833341}, {"track": 1, "start": 10.799982, "end": 11.368731052083334, "pitch": 64, "velocity": 80, "duration": 0.5687490520833336}, {"track": 1, "start": 10.799982, "end": 11.368731052083334, "pitch": 74, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 10.799982, "end": 11.368731052083334, "pitch": 53, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 10.799982, "end": 11.368731052083334, "pitch": 58, "velocity": 80, "duration": 0.5687490520833336}, {"track": 3, "start": 10.799982, "end": 11.398731002083332, "pitch": 64, "velocity": 80, "duration": 0.5987490020833324}, {"track": 4, "start": 10.799982, "end": 12.598729002083333, "pitch": 50, "velocity": 80, "duration": 1.7987470020833332}, {"track": 4, "start": 10.799982, "end": 12.598729002083333, "pitch": 53, "velocity": 80, "duration": 1.7987470020833332}, {"track": 4, "start": 10.799982, "end": 12.598729002083333, "pitch": 58, "velocity": 80, "duration": 1.7987470020833332}, {"track": 1, "start": 11.399981, "end": 11.968730052083334, "pitch": 62, "velocity": 80, "duration": 0.5687490520833336}, {"track": 1, "start": 11.399981, "end": 11.968730052083334, "pitch": 70, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 11.399981, "end": 11.968730052083334, "pitch": 46, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 11.399981, "end": 11.968730052083334, "pitch": 53, "velocity": 80, "duration": 0.5687490520833336}, {"track": 3, "start": 11.399981, "end": 11.998730002083333, "pitch": 62, "velocity": 80, "duration": 0.5987490020833324}, {"track": 1, "start": 11.99998, "end": 12.378729368750001, "pitch": 70, "velocity": 80, "duration": 0.3787493687500003}, {"track": 1, "start": 11.99998, "end": 12.378729368750001, "pitch": 74, "velocity": 80, "duration": 0.3787493687500003}, {"track": 2, "start": 11.99998, "end": 12.378729368750001, "pitch": 53, "velocity": 80, "duration": 0.3787493687500003}, {"track": 2, "start": 11.99998, "end": 12.378729368750001, "pitch": 58, "velocity": 80, "duration": 0.3787493687500003}, {"track": 3, "start": 11.99998, "end": 12.398729335416666, "pitch": 70, "velocity": 80, "duration": 0.3987493354166656}, {"track": 1, "start": 12.399979333333334, "end": 12.588729018750001, "pitch": 70, "velocity": 80, "duration": 0.18874968541666703}, {"track": 1, "start": 12.399979333333334, "end": 12.588729018750001, "pitch": 74, "velocity": 80, "duration": 0.18874968541666703}, {"track": 2, "start": 12.399979333333334, "end": 12.588729018750001, "pitch": 53, "velocity": 80, "duration": 0.18874968541666703}, {"track": 2, "start": 12.399979333333334, "end": 12.588729018750001, "pitch": 55, "velocity": 80, "duration": 0.18874968541666703}, {"track": 3, "start": 12.399979333333334, "end": 12.598729002083333, "pitch": 70, "velocity": 80, "duration": 0.19874966874999878}, {"track": 1, "start": 12.599979, "end": 13.168728052083335, "pitch": 69, "velocity": 80, "duration": 0.5687490520833354}, {"track": 1, "start": 12.599979, "end": 13.168728052083335, "pitch": 72, "velocity": 80, "duration": 0.5687490520833354}, {"track": 2, "start": 12.599979, "end": 13.168728052083335, "pitch": 53, "velocity": 80, "duration": 0.5687490520833354}, {"track": 2, "start": 12.599979, "end": 13.168728052083335, "pitch": 60, "velocity": 80, "duration": 0.5687490520833354}, {"track": 3, "start": 12.599979, "end": 13.198728002083334, "pitch": 69, "velocity": 80, "duration": 0.5987490020833341}, {"track": 4, "start": 12.599979, "end": 13.798727002083334, "pitch": 48, "velocity": 80, "duration": 1.1987480020833345}, {"track": 4, "start": 12.599979, "end": 13.798727002083334, "pitch": 53, "velocity": 80, "duration": 1.1987480020833345}, {"track": 4, "start": 12.599979, "end": 13.798727002083334, "pitch": 57, "velocity": 80, "duration": 1.1987480020833345}, {"track": 1, "start": 13.199978, "end": 13.768727052083333, "pitch": 65, "velocity": 80, "duration": 0.5687490520833336}, {"track": 1, "start": 13.199978, "end": 13.768727052083333, "pitch": 77, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 13.199978, "end": 13.768727052083333, "pitch": 50, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 13.199978, "end": 13.768727052083333, "pitch": 57, "velocity": 80, "duration": 0.5687490520833336}, {"track": 3, "start": 13.199978, "end": 13.798727002083334, "pitch": 65, "velocity": 80, "duration": 0.5987490020833341}, {"track": 1, "start": 13.799977, "end": 14.368726052083334, "pitch": 67, "velocity": 80, "duration": 0.5687490520833336}, {"track": 1, "start": 13.799977, "end": 14.368726052083334, "pitch": 76, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 13.799977, "end": 14.368726052083334, "pitch": 48, "velocity": 80, "duration": 0.5687490520833336}, {"track": 2, "start": 13.799977, "end": 14.368726052083334, "pitch": 58, "velocity": 80, "duration": 0.5687490520833336}, {"track": 3, "start": 13.799977, "end": 14.398726002083333, "pitch": 67, "velocity": 80, "duration": 0.5987490020833324}, {"track": 4, "start": 13.799977, "end": 14.398726002083333, "pitch": 48, "velocity": 80, "duration": 0.5987490020833324}, {"track": 4, "start": 13.799977, "end": 14.398726002083333, "pitch": 52, "velocity": 80, "duration": 0.5987490020833324}, {"track": 4, "start": 13.799977, "end": 14.398726002083333, "pitch": 55, "velocity": 80, "duration": 0.5987490020833324}, {"track": 1, "start": 14.399976, "end": 16.108723152083332, "pitch": 69, "velocity": 80, "duration": 1.7087471520833315}, {"track": 1, "start": 14.399976, "end": 16.108723152083332, "pitch": 77, "velocity": 80, "duration": 1.7087471520833315}, {"track": 2, "start": 14.399976, "end": 16.108723152083332, "pitch": 53, "velocity": 80, "duration": 1.7087471520833315}, {"track": 2, "start": 14.399976, "end": 16.108723152083332, "pitch": 60, "velocity": 80, "duration": 1.7087471520833315}, {"track": 3, "start": 14.399976, "end": 14.59872566875, "pitch": 65, "velocity": 80, "duration": 0.19874966874999878}, {"track": 4, "start": 14.399976, "end": 16.198723002083334, "pitch": 48, "velocity": 80, "duration": 1.7987470020833332}, {"track": 4, "start": 14.399976, "end": 16.198723002083334, "pitch": 53, "velocity": 80, "duration": 1.7987470020833332}, {"track": 4, "start": 14.399976, "end": 16.198723002083334, "pitch": 57, "velocity": 80, "duration": 1.7987470020833332}, {"track": 3, "start": 14.599975666666666, "end": 14.798725335416668, "pitch": 69, "velocity": 80, "duration": 0.19874966875000233}, {"track": 3, "start": 14.799975333333334, "end": 14.998725002083333, "pitch": 72, "velocity": 80, "duration": 0.19874966874999878}, {"track": 3, "start": 14.999975, "end": 15.19872466875, "pitch": 77, "velocity": 80, "duration": 0.19874966875000055}, {"track": 3, "start": 15.199974666666666, "end": 15.398724335416667, "pitch": 81, "velocity": 80, "duration": 0.19874966875000055}, {"track": 3, "start": 15.399974333333335, "end": 15.598724002083333, "pitch": 84, "velocity": 80, "duration": 0.19874966874999878}, {"track": 3, "start": 15.599974, "end": 15.79872366875, "pitch": 89, "velocity": 80, "duration": 0.19874966875000055}, {"track": 3, "start": 15.799973666666666, "end": 15.998723335416667, "pitch": 93, "velocity": 80, "duration": 0.19874966875000055}, {"track": 3, "start": 15.999973333333333, "end": 16.198723002083334, "pitch": 96, "velocity": 80, "duration": 0.19874966875000055}, {"track": 3, "start": 16.199973, "end": 16.498722502083332, "pitch": 101, "velocity": 80, "duration": 0.2987495020833322}, {"track": 4, "start": 16.199973, "end": 16.348722752083333, "pitch": 41, "velocity": 80, "duration": 0.14874975208333296}]';


initialize();
animate();

function getMusic() {
  // musicFile = document.getElementById("inputFile").files[0];

  let title = document.getElementById("title");
  title.textContent = "Happy Birthday";

  // let sourceNotes = parseJSON("scripts/happy-birthday-simplified.json");
  let sourceNotes = JSON.parse(happyBirthdaySimplifiedJSON);

  let maxPitch = -Infinity, minPitch = Infinity;
  let maxTrack = -Infinity, minTrack = Infinity;
  for (let i = 0; i < sourceNotes.length; i++) {
    let note = sourceNotes[i];
    maxPitch = Math.max(maxPitch, note.pitch);
    minPitch = Math.min(minPitch, note.pitch);
    maxTrack = Math.max(maxTrack, note.track);
    minTrack = Math.min(minTrack, note.track);
    notes.push(note);
  }

  displacementVector.y = minPitch + (maxPitch - minPitch) / 2;
  displacementVector.z = minTrack + (maxTrack - minTrack) / 2;

  // TODO: Fix arbitrary scaling
  scalingVector.x = 1.5;
  scalingVector.y = 0.25;
  scalingVector.z = 0.25;

  spacingVector.z = 2;
}

function initialize() {
  getMusic();

  let canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  scene = new THREE.Scene();

  let backgroundColor = getComputedStyle(document.body).backgroundColor;
  scene.background = new THREE.Color(backgroundColor);

  let frustumSize = 10;
  let aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  camera = new THREE.OrthographicCamera(
    frustumSize * aspectRatio / -2, frustumSize * aspectRatio / 2,
    frustumSize / 2, frustumSize / -2,
    -50, 50
  );
  camera.position.set(0, 0, 3);

  let ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xFFFFFF);
  directionalLight.position.copy(camera.position);
  directionalLight.position.add(directionalLightDisplacementVector);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.shadowMap.enabled = true;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  // TODO: change to trackball control

  // Static visualization
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let boxGeometry = new THREE.BoxGeometry(note.duration, 1, 1);
    boxGeometry.scale(scalingVector.x, scalingVector.y, scalingVector.z);
    let boxMaterial = new THREE.MeshStandardMaterial({
      color: "blue", transparent: true, opacity: 0.3 // TODO: opacity to be dynamics
    });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(note.start + note.duration / 2, note.pitch, note.track);
    box.position.sub(displacementVector).multiply(scalingVector).multiply(spacingVector);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    let edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    let edgesMaterial = new THREE.LineBasicMaterial({
      color: boxMaterial.color, transparent: true, opacity: 0.4
    });
    let edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    edges.position.copy(box.position);
    edges.castShadow = true;
    edges.receiveShadow = true;
    scene.add(edges);
  }
}

function animate() {
  requestAnimationFrame(animate);

  directionalLight.position.copy(camera.position);
  directionalLight.position.add(directionalLightDisplacementVector);

  // Use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}

function parseJSON(path) {
  var result;
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", path, false);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      result = JSON.parse(xobj.responseText);
    }
  };
  xobj.send(null);
  return result;
}
