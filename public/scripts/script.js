
var mysrc = "dwarf.jpg";
function changeImage() {
    if (mysrc == "dwarf.jpg") {
        document.images["pic"].src = "https://www.d20pfsrd.com/wp-content/uploads/sites/12/2017/01/Dwarf1-fat-goblin-games-smaller.png";
        document.images["pic"].alt = "Dwarf";
        mysrc = "elf.jpg";
    } else if (mysrc == "elf.jpg") {
        document.images["pic"].src = "https://www.d20pfsrd.com/wp-content/uploads/sites/12/2017/05/DeanSpencer-elfrogue-reduced.png";
        document.images["pic"].alt = "Elf";
        mysrc = "gnome.jpg";
    } else if (mysrc == "gnome.jpg") {
        document.images["pic"].src = "http://www.fluidoweb.com/images/SoloLearn/mars.jpg";
        document.images["pic"].alt = "Gnome";
        mysrc = "halfElf.jpg";
    } else if (mysrc == "halfElf.jpg") {
        document.images["pic"].src = "https://2img.net/h/i187.photobucket.com/albums/x108/Darkemperess6/half-elf-b_zpsj9mgqqyr.png";
        document.images["pic"].alt = "Half Elf";
        mysrc = "halfOrc.jpg";
    } else if (mysrc == "halfOrc.jpg") {
        document.images["pic"].src = "https://pathfinderwrathoftherighteous.wiki.fextralife.com/file/Pathfinder-Wrath-of-the-Righteous/half-orc-pathfinder-wiki-guide.png";
        document.images["pic"].alt = "Half Orc";
        mysrc = "halfling.jpg";
    } else if (mysrc == "halfling.jpg") {
        document.images["pic"].src = "https://www.worldanvil.com/uploads/images/74d4e06eff04fea0f5208f77a03b37ca.png";
        document.images["pic"].alt = "halfling";
        mysrc = "human.jpg";
    } else {
        document.images["pic"].src = "https://i.pinimg.com/originals/de/d8/b5/ded8b5be5f1712e3633d7d47946295c2.png";
        document.images["pic"].alt = "Human";
        mysrc = "dwarf.jpg";
    }
}

//  ----------CAROUSELS -----------------

$(document).ready(function() {
    $("#myCarousel").on("slide.bs.carousel", function(e) {
      var $e = $(e.relatedTarget);
      var idx = $e.index();
      var itemsPerSlide = 3;
      var totalItems = $(".carousel-item").length;
  
      if (idx >= totalItems - (itemsPerSlide - 1)) {
        var it = itemsPerSlide - (totalItems - idx);
        for (var i = 0; i < it; i++) {
          // append slides to end
          if (e.direction == "left") {
            $(".carousel-item")
              .eq(i)
              .appendTo(".carousel-inner");
          } else {
            $(".carousel-item")
              .eq(0)
              .appendTo($(this).find(".carousel-inner"));
          }
        }
      }
    });
  });

  //---- RANGE SLIDERS ---------

  var rangeSlider = function(){
    var slider = $('.range-slider'),
        range = $('.range-slider__range'),
        value = $('.range-slider__value');
      
    slider.each(function(){
  
      value.each(function(){
        var value = $(this).prev().attr('value');
        $(this).html(value);
      });
  
      range.on('input', function(){
        $(this).next(value).html(this.value);
      });
    });
  };
  
  rangeSlider();

//   -----STATS.HTML ------ tab/page transition
  $(document).ready(function () {

    $(".next-step").click(function (e) {

        var $active = $('.nav-tabs li.active');
        $active.next().removeClass('disabled');
        nextTab($active);

    });
    $(".prev-step").click(function (e) {

        var $active = $('.nav-tabs li.active');
        prevTab($active);

    });
});
function nextTab(elem) {
    $(elem).next().find('a[data-toggle="tab"]').click();
}
function prevTab(elem) {
    $(elem).prev().find('a[data-toggle="tab"]').click();
}
 //-------- USER INPUT NOTES ----------
 const createButton = document.querySelector('.createButton, .createButtonSpell');
 const noteCreator = document.querySelector('.noteCreator, .noteCreatorSpell');
 const noteTitle = document.querySelector('.noteTitle, .noteTitleSpell');
 const noteBody = document.querySelector('.noteBody, .noteBodySpell');
 const saveButton = document.querySelector('.saveButton, .saveButtonSpell');
 const cancelButton = document.querySelector('.cancelButton, .cancelButtonSpell');

 const createdNotes = document.querySelector('.createdNotes, .createdNotesSpell');
 const savedNotesDB = [];

 let idCounter = -1;
 let i = -1;

 //Fade in, fade out
 function fadeIn(el){
     el.classList.add('show');
     el.classList.remove('hide');  
 }
 function fadeOut(el){
     el.classList.add('hide');
     el.classList.remove('show');  
 }

 //Show and hide Note Creator
 createButton.addEventListener('click', () => {
     if ( noteCreator.className.indexOf('hide') !== -1 ) {
         fadeIn(noteCreator);
     } else {
         fadeOut(noteCreator);
     }
 });

 //Cancel Button
 cancelButton.addEventListener('click', () => {
     noteTitle.value = '';
     noteBody.value = '';
     fadeOut(noteCreator);
 });

 //Reset Editor
 function resetEditor() {
     noteTitle.value = '';
     noteBody.value = '';
     fadeOut(noteCreator);
 }

 //Object printer
 function printObject(elementToCreate, className, dbContent, placeLocation) {
     let printBody = document.createElement(elementToCreate);
     printBody.className = className;
     printBody.innerHTML = dbContent;
     if ( printBody.className === 'savedNote' ) {
         idCounter += 1;
         i += 1;
         printBody.id = 'n' + idCounter;
     };
     document.querySelector(placeLocation).appendChild(printBody);            
 };

 //Create new note
 saveButton.addEventListener('click', () => {
     let noteContent = {
         title: '',
         body: ''
     }

     //Push content to the DB
     noteContent.title = noteTitle.value;
     noteContent.body = noteBody.value;
     savedNotesDB.push(noteContent);

     if ( noteContent.title !== '' || noteContent.body !== '' ) {
         //Print content
         printObject('div', 'savedNote', '', '.createdNotes');
         printObject('h2', 'savedNoteTitle', savedNotesDB[i].title, '.savedNote:last-child');
         printObject('p', 'savedNoteBody', savedNotesDB[i].body, '.savedNote:last-child');

         let printDelete = document.createElement('a');
         printDelete.innerHTML = 'delete';
         printDelete.className = 'deleteButton';
         printDelete.onclick = function () {
             let childToDelete = document.getElementById('n' + idCounter );
             createdNotes.removeChild(childToDelete);
             idCounter -= 1;
         };
         document.querySelector('.savedNote:last-child').appendChild(printDelete);

         resetEditor();
     } else {
         resetEditor();
         savedNotesDB.pop();
     }
 });


 //-------- SPELL TRACKER  ----------
 $(function () {
     function moveItems(origin, dest) {
         $(origin).find(':selected').appendTo(dest);
     }

     function moveAllItems(origin, dest) {
         $(origin).children().appendTo(dest);
     }

     $('#left').click(function () {
         moveItems('#sbTwo', '#sbOne');
     });

     $('#right').on('click', function () {
         moveItems('#sbOne', '#sbTwo');
     });

     $('#leftall').on('click', function () {
         moveAllItems('#sbTwo', '#sbOne');
     });

     $('#rightall').on('click', function () {
         moveAllItems('#sbOne', '#sbTwo');
     });
 });
// User Adding stats

// const createButton = document.querySelector('.createButton');
// const noteCreator = document.querySelector('.noteCreator');

// const noteTitle = document.querySelector('.noteTitle');
// const noteBody = document.querySelector('.noteBody');
// const saveButton = document.querySelector('.saveButton');
// const cancelButton = document.querySelector('.cancelButton');

// const createdNotes = document.querySelector('.createdNotes');
// const savedNotesDB = [];

// let idCounter = -1;
// let i = -1;

// //Fade in, fade out
// function fadeIn(el){
//     el.classList.add('show');
//     el.classList.remove('hide');  
// }
// function fadeOut(el){
//     el.classList.add('hide');
//     el.classList.remove('show');  
// }

// //Show and hide Note Creator
// createButton.addEventListener('click', () => {
//     if ( noteCreator.className.indexOf('hide') !== -1 ) {
//         fadeIn(noteCreator);
//     } else {
//         fadeOut(noteCreator);
//     }
// });

// //Cancel Button
// cancelButton.addEventListener('click', () => {
//     noteTitle.value = '';
//     noteBody.value = '';
//     fadeOut(noteCreator);
// });

// //Reset Editor
// function resetEditor() {
//     noteTitle.value = '';
//     noteBody.value = '';
//     fadeOut(noteCreator);
// }

// //Object printer
// function printObject(elementToCreate, className, dbContent, placeLocation) {
//     let printBody = document.createElement(elementToCreate);
//     printBody.className = className;
//     printBody.innerHTML = dbContent;
//     if ( printBody.className === 'savedNote' ) {
//         idCounter += 1;
//         i += 1;
//         printBody.id = 'n' + idCounter;
//     };
//     document.querySelector(placeLocation).appendChild(printBody);            
// };

// //Create new note
// saveButton.addEventListener('click', () => {
//     let noteContent = {
//         title: '',
//         body: ''
//     }

//     //Push content to the DB
//     noteContent.title = noteTitle.value;
//     noteContent.body = noteBody.value;
//     savedNotesDB.push(noteContent);

//     if ( noteContent.title !== '' || noteContent.body !== '' ) {
//         //Print content
//         printObject('div', 'savedNote', '', '.createdNotes');
//         printObject('h2', 'savedNoteTitle', savedNotesDB[i].title, '.savedNote:last-child');
//         printObject('p', 'savedNoteBody', savedNotesDB[i].body, '.savedNote:last-child');

//         let printDelete = document.createElement('a');
//         printDelete.innerHTML = 'törlés';
//         printDelete.className = 'deleteButton';
//         printDelete.onclick = function () {
//             let childToDelete = document.getElementById('n' + idCounter );
//             createdNotes.removeChild(childToDelete);
//             idCounter -= 1;
//         };
//         document.querySelector('.savedNote:last-child').appendChild(printDelete);

//         resetEditor();
//     } else {
//         resetEditor();
//         savedNotesDB.pop();
//     }
// });