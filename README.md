# Visualizing Music
**Evan Mitchell and Merissa Tan**  
John David N. Dionisio, PhD  
Loyola Marymount University

## Abstract
The traditional system of music notation that we know today has been used for centuries by musicians across the West; however, while it is an efficient and reproducible rendering of musical information, it is difficult to understand without training. In our research, we identified alternative ways to visualize music so that musical patterns which are not apparent in traditional notation can be easily recognized by non-musicians. To implement these alternative visualizations, we developed a web application that allows users to upload music in the form of a MIDI file. A server-side Python script utilizes the [py_midicsv](https://github.com/timwedde/py_midicsv) library to convert the MIDI file to a usable JSON format. Client-side JavaScript then uses the [three.js](https://github.com/mrdoob/three.js/) library to represent the musical notes as 3-D shapes in the browser. Each MIDI track is represented by a different color, allowing users to examine each instrument's part individually. At the same time, these tracks are overlaid, giving users the opportunity to understand the work as a whole and easily identify common themes in different parts. In addition, the website utilizes the [soundfont-player](https://github.com/danigb/soundfont-player) library to allow users to listen to the music they are viewing. We hope that our visualization system offers a new, insightful, and interesting way to look at music.

### Acknowledgments
Sample MIDI files were obtained from MuseScore's [OpenScore](https://openscore.cc/) initiative.  
*midi_process.py* is based on Peter Jonas's [midicsv-process](https://github.com/shoogle/midicsv-process).  
<!-- Spherical visualization was inspired by Nicholas Rougeux's [Off the Staff](https://www.c82.net/offthestaff/) project. -->
