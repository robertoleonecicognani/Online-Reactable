## Online Reactable: Cantus Firmus and Counterpoints
<img align="left" src="readMeImages/MAE logo.png"  width="10%" style="margin-left:5px; margin-bottom:10px">
The Online Reactable is a version on web page of a reactable, i.e., a real-time intuitive electronical musical instrument consisting in a touch screen surface, which is an interface between the user and the music production, and in buttons representing oscillators, filters and effects. By shifting and chaining buttons on the surface a sound pattern is composed, emulating the behavior of an analogue synthesizer. Parameters can be changed to obtain different kind of results.<br>

The regular mode of Reactable plays a melody founded by us and has been used for ACTaM final project. In this version, a full set of Cantus Firmus melodies is instead available for the user, who can also choose to create counterpoints in real-time that fit with the corresponding Cantus Firmus.<br>

For these purposes, new functionalities and buttons have been added. Our goal was to combine the ancient art of Counterpoint and the modern effects of the Reactable to produce an original experience. The project has been developed for the course of Computer Music Representations and Models for the Music and Acoustic Engineering Master’s degree of the Politecnico di Milano. 

### [Our Project!](https://codepen.io/umutus/full/PomQKbY "s")
### [Our Presentation!](https://docs.google.com/presentation/d/1MoYUUQgi9hw5hNLMDHu8yOKbb-zAymc9tvgKWwkR_yY/edit#slide=id.p1 "s")


## How do you use it? 
![Screenshot (590)](https://user-images.githubusercontent.com/82660558/127182736-fc64d30c-8ff9-4313-b5a0-70e92a292118.png)

The new buttons are placed underneath the Envelope Regulator. It is important to underline that, with respect to most of the other objects of the Online Reactable, these ones are fixed and do not need to move, be linked between them or to the output node to apply their effect. Like the Envelope Regulator, their function is combined with the sound and its alteration, produced by sin waves, filters and effects.<br>The buttons are: 
- a Cantus Firmus button, 
- a switch button
- buttons enumerated from 1 to 4

![Screenshot (593)](https://user-images.githubusercontent.com/82660558/127183126-6eb072e9-84c1-4e9d-91cc-8226d4739923.png)


The first one is the biggest and has a logo on it (“Cantus Firmus”) and its purpose is to reproduce a Cantus Firmus. Clicking on this button it toggles an active state and turns from blue to red. When this happens, all the newly created oscillators, when connected to the output node, start playing a fixed melody from the Online Reactable's set. If the button is clicked again it will stop play playing, reset to a non active state and turn blue as before.<br>

The switch button is the arrow in a green square, next to the previous one. Clicking on it, the current “Cantus Firmus” is changed with another one in the set.<br>

The user can also choose the species of the counterpoint which he wants to associate the Cantus Firmus with by clicking the corresponding button among the numered four ones. Intiutively, button 1 is corresponds to the first species, button 2 to the second, and so on.<br> 
Again, when one of these four objects is clicked, it gets active, becomes red and starts playing the counterpoint.<br> As they are clicked another time they instead turn inactive and black and they stop playing. Only one of the four can be used at the time. This means that if a button is clicked after another one, the previous stops working and the produced species of counterpoint changed.<br>

The technique of backtracking was essential in our counterpoint implementation, making it possible to go back and fix choices that would produce a dead end for the counterpoint. If the algorithm detects a dead-end, it goes back to a note that has another possibility and chooses randomly from that collection. This way it eventually finds a path that works.<br> 

## Files
_Web Reactable_ is composed of:

- **index.html**
contains the main layout of the interface, the embedding of the script components, the CSS file and the libraries.
- **main.js**
contains the main functions and the application of Tone.js and other dependencies

- **styles.css**
contains the styling of the application


## Dependencies

- [**Teoria**]: A library that extracts properties of music components such as notes, intervals and modes from a given series of notes.
- [**React**]: Structure of the web page and of the view.
- [**Tone.js**]: A web audio framework for creating interactive music in the web intuitively version: 14.8.26.
- [**jQuery**]: Library that facilitates communication between html and JS and is optimal for event handling and animation.

©

## Authors
Umut Fidan<br>
Roberto Leone Cicognani<br>
Claudio César Armas Monroy<br>
