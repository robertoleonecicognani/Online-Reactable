## Online Reactable: Cantus Firmus and Counterpoints
<img align="left" src="readMeImages/MAE logo.png"  width="10%" style="margin-left:5px; margin-bottom:10px">
The Online Reactable is the recreation of a reactable on a web page that allows the user to create & combine sound waves, filters and effects in real time in an intuitive way.<br><br>

The regular mode of Reactable plays a melody founded by us and has been used for ACTaM final project. However when the user sets the Countus Firmus button, all the newly created oscillators starts playing a Countus firmus melody. The Online Reactable has a set of Cantus Firmus(CF) among which the user can choose that can be played. The user can also choose to this create counterpoints in real-time that fits with the corresponding CF. The user can select the species of these counterpoints and the Online Reactable will generate the new counterpoint with the specified specie. The technique of backtracking was essential in our implementation, making it possible to go back and fix choices that would produce a dead end for the counterpoint. If the algorithm detects a dead-end, it goes back to a note that has another possibility and chooses randomly from that collection. This way it eventually finds a path that works. 

Our goal was to combine the ancient art of Counterpoint and the modern Reactable with modern effects, to produce a new experience for the user. The project has been developed for the course of Computer Music Representations and Models for the Music and Acoustic Engineering Master’s degree of the Politecnico di Milano.

## How do you use it? 
![Screenshot (590)](https://user-images.githubusercontent.com/82660558/127182736-fc64d30c-8ff9-4313-b5a0-70e92a292118.png)

The section regarding the functionality of choosing a Cantus Firmus and generate a counterpoint for it is underneath the Envelope Regulator and consists in the following objects: 
-a Cantus Firmus button, 
-a switch button
-four buttons enumerated from 1 to 4
It is important to underline that, with respect to most of the other objects, these ones are fixed and do not need to move, be linked between them or to the output node to apply their effect. Like the envelope regulator, their function is combined with the sound, and its alteration, produced by sin waves, filters and effects. 


![Screenshot (593)](https://user-images.githubusercontent.com/82660558/127183126-6eb072e9-84c1-4e9d-91cc-8226d4739923.png)



The first one is the bigger one and has a logo (“Cantus Firmus”) above. It allows to reproduce a Cantus Firmus and acts like a play button: clicking on it a fixed melody from the Online Reactable set starts playing. When this happen the button is active and from blue turns to red. 
The switch button is the arrow in a green box, at the right of the previous one. Clicking on it, it is possible to change the current “Cantus Firmus” with another one in the set. 
Finally, the four buttons under the previous two are related to the counterpoint. The user can choose intuitively the species of the counterpoint which he wants to associate to the Cantus Firmus and click the corresponding button. Obviously button 1 is related to the first species, button 2 to the second, button 3 to the third and button 4 to the fourth. When a button is clicked it gets active and starts playing the counterpoint. Active buttons become red, clicking again on them they turn black and stop playing. Only one button can be active at the time, which means that if a button is clicked after another one, the previous stops working and the species of counterpoint produces changed. 

