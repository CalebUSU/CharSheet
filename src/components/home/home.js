import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useState, useRef } from 'react';
import { addDoc, collection, onSnapshot, getFirestore } from "firebase/firestore";
import { FaBars } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io'
import { Route, Routes, Navigate } from 'react-router-dom';

import { About } from '../tabs/about';
import { Characteristics } from '../tabs/characteristics'
import { Complications } from '../tabs/complications';
import { Martial } from '../tabs/martial';
import { Perks } from '../tabs/perks';
import { Powers } from '../tabs/powers';
import { Skills } from '../tabs/skills';
import { Talents } from '../tabs/talents';
import { Settings } from '../tabs/settings';

export const Home = () => {
  const [loadingChars, setLoadingChars] = useState(true);
  const [characters, setCharacters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [sideBar, setSideBar] = useState(false);
  const charactersRef = useRef([]);

  useEffect(() => {
    document.title = ("Loading... - Hero Sheet");

    //get characters
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, ("users/"+getAuth().currentUser.uid+"/characters")), (snapshot) => {
			snapshot.docChanges().forEach((change) => {//checks all changes in an update
				if (change.type === "added") {
					charactersRef.current.push({ id: change.doc.id, ...change.doc.data() })
				}
			  if (change.type === "modified") {
					const index = charactersRef.current.findIndex((character) => character.id === change.doc.id);
					charactersRef.current[index] = { id: change.doc.id, ...change.doc.data() };
				}
			});
      setCharacters([...charactersRef.current])
      
      setLoadingChars(false);
      document.title = ("Hero Sheet");
		});
		
		return unsubscribe;
  }, []);

  const genEmptyCharacter = async () => {
    const db = getFirestore();

    var about = {
      name: "Default",
      nicknames: "",
      background: "",
      personality: "",
      quote: "",
      tactics: "",
      useage: "",
      appearance: "",
    };

    var characteristics = {
      str: "10",
      dex: "10",
      con: "10",
      int: "10",
      ego: "10",
      pre: "10",
      ocv: "3",
      dcv: "3",
      omcv: "3",
      dmcv: "3",
      spd: "2",
      pd: "2",
      ed: "2",
      rec: "4",
      end: "20",
      body: "10",
      stun: "20",
      running: "12",
      swimming: "4",
      leaping: "4",
    };
    
		await addDoc(collection(db, ("users/"+getAuth().currentUser.uid+"/characters")), {
      about: about,
      characteristics: characteristics,
      skills: [],
      perks: [],
      talents: [],
      martials: [],
      powers: [],
      complications: [],
    })
  }

  const logOut = () => {
		const auth = getAuth();
		signOut(auth);
  }

  const changeChar = (index) => {
    setSideBar(false);
    setCurrentIndex(index);
  }

  if (loadingChars) {
    return <div>Loading, please wait</div>;
  }

  return (
      <div className='primary-container'>
        <header className='top-bar'>
          <nav className='nav-options'>
            <button type="button" className="button" onClick={() => (setSideBar(!sideBar))}><FaBars /></button>
            
            {(currentIndex != null) && <div>
              <button type="button" className="button" onClick={() => (window.location.href = "/#/about")}>About</button>
              <button type="button" className="button" onClick={() => (window.location.href = "/#/characteristics")}>Characteristics</button>
              <button type="button" className="button" onClick={() => (window.location.href = "/#/skills")}>Skills</button>
              <button type="button" className="button" onClick={() => (window.location.href = "/#/perks")}>Perks</button>
              <button type="button" className="button" onClick={() => (window.location.href = "/#/talents")}>Talents</button>
              <button type="button" className="button" onClick={() => (window.location.href = "/#/martial")}>Martial</button>
              <button type="button" className="button" onClick={() => (window.location.href = "/#/powers")}>Powers</button>
              <button type="button" className="button" onClick={() => (window.location.href = "/#/complications")}>Complications</button>
            </div>}

            <div className='filler'/>
             
            {(currentIndex != null) && <button type="button" className="button" onClick={() => (window.location.href = "/#/settings")}><IoMdSettings/></button>}
            <button type="button" className="button" onClick={logOut}>Logout</button>
          </nav>
        </header>

        <div className={sideBar ? 'drawer' : 'drawer drawer-close'}> 
            {characters.map((character, index) => (
              <div key={character.id}>
                <button type="button" className="character" onClick={() => (changeChar(index))}>{character.about.name}</button>
              </div>
            ))}
            <button type="button" onClick={genEmptyCharacter}>New Character</button>
          </div>
        
        <div className='main-view'>
          {!(currentIndex != null) && <div>Select a character from the sidebar</div>}
          {(currentIndex != null) && <div>
          <Routes>
            <Route path="about" element={<About user={getAuth().currentUser} character={characters[currentIndex]}/>} />
            <Route path="characteristics" element={<Characteristics user={getAuth().currentUser} character={characters[currentIndex]}/>} />
            <Route path="complications" element={<Complications user={getAuth().currentUser} character={characters[currentIndex]}/>} />
            <Route path="martial" element={<Martial user={getAuth().currentUser} character={characters[currentIndex]}/>} />
            <Route path="perks" element={<Perks user={getAuth().currentUser} character={characters[currentIndex]}/>} />
            <Route path="powers" element={<Powers user={getAuth().currentUser} character={characters[currentIndex]}/>} />
            <Route path="skills" element={<Skills user={getAuth().currentUser} character={characters[currentIndex]}/>} />
            <Route path="talents" element={<Talents user={getAuth().currentUser} character={characters[currentIndex]}/>} />
            <Route path="settings" element={<Settings user={getAuth().currentUser} character={characters[currentIndex]}/>} />

            <Route path="/*" element={<Navigate push to={"about"}/>} />
          </Routes>
          </div>}
        </div>
        
      </div>
  );
}