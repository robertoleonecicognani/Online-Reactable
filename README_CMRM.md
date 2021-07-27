## Online Reactable: Cantus Firmus and Counterpoints
The Online Reactable allows to intutively and easily exploit sound waves, filters and effects in the reproduction of a melody. However it is also possible to make independent phrases interacting each other to obtain more pleasant and effective music. 
The Online Reactable has a set of Cantus Firmus among which the user can choose that can be played making use of all the objects in the frame of the workspace. Besides this, this tool can create and reproduce in real-time counterpoints that fit with the corresponding fixed melody. The user can select the species of these counterpoints and the Online Reactable will react as a consequence. The tecnique of backtracking was cardinal in our implementation, making it possible to consider in the generation of counterpoint the previously chosen notes to detect the following one. Moreover, it consents to correct eventual mistakes (infraction of the rules) done in the process. 
Our goal was to improve the espierence of the user in this fusion between the ancient tecnique of Cantus Firmus and Counterpoints and the modern Reactable. The project has been developed for the course of Computer Music Representations and Models for the Music and Acoustic Engineering Master’s degree of the Politecnico di Milano.

## How do you use it? 
![Screenshot (590)](https://user-images.githubusercontent.com/82660558/127182736-fc64d30c-8ff9-4313-b5a0-70e92a292118.png)

The section reguarding the functionality of choosing a Cantus Firmus and generate a counterpoint for it is underneath the Envelope Regulator and consists in the following objects: 
-a Cantus Firmus button, 
-a switch button
-four buttons enumerated from 1 to 4
It is important to underline that, with respect to most of the other objects, these ones are fixed and do not need to move, be linked between them or to the output node to apply their effect. Like the envelope regulator, their function is combined with the sound, and its alteration, produced by sin waves, filters and effects. 
The first one is the bigger one and has a logo (“Cantus Firmus”) above. It allows to reproduce a Cantus Firmus and acts like a play button: clicking on it a fixed melody from the Online Reactable set starts playing. When this happen the button is active and from blue turns to red. 
The switch button is the arrow in a green box, at the right of the previous one. Clicking on it, it is possible to change the current “Cantus Firmus” with another one in the set. 
Finally, the four buttons under the previous two are related to the counterpoint. The user can choose intuitively the species of the counterpoint which he wants to associate to the Cantus Firmus and click the corresponding button. Obviously button 1 is related to the first species, button 2 to the second, button 3 to the third and button 4 to the fourth. When a button is cliked it gets active and starts playing the counterpoint. Active buttons become red, clicking again on them they turn black and stop playing. Only one button can be active at the time, which means that if a button is clicked after another one, the previous stops working and the species of counterpoint produces changed. 

