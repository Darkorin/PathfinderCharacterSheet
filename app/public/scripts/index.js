
//   var mysrc = "dwarf.jpg";
//   function changeImage() {
//     if (mysrc == "dwarf.jpg") {
//       document.images["pic"].src = "https://www.d20pfsrd.com/wp-content/uploads/sites/12/2017/01/Dwarf1-fat-goblin-games-smaller.png";
//       document.images["pic"].alt = "Dwarf";
//       mysrc = "elf.jpg";
//     } else if (mysrc == "elf.jpg") {
//       document.images["pic"].src = "https://www.d20pfsrd.com/wp-content/uploads/sites/12/2017/05/DeanSpencer-elfrogue-reduced.png";
//       document.images["pic"].alt = "Elf";
//       mysrc = "gnome.jpg";
//     } else if (mysrc == "gnome.jpg") {
//       document.images["pic"].src = "http://www.fluidoweb.com/images/SoloLearn/mars.jpg";
//       document.images["pic"].alt = "Gnome";
//       mysrc = "halfElf.jpg";
//     } else if (mysrc == "halfElf.jpg") {
//       document.images["pic"].src = "https://2img.net/h/i187.photobucket.com/albums/x108/Darkemperess6/half-elf-b_zpsj9mgqqyr.png";
//       document.images["pic"].alt = "Half Elf";
//       mysrc = "halfOrc.jpg";
//     } else if (mysrc == "halfOrc.jpg") {
//       document.images["pic"].src = "https://pathfinderwrathoftherighteous.wiki.fextralife.com/file/Pathfinder-Wrath-of-the-Righteous/half-orc-pathfinder-wiki-guide.png";
//       document.images["pic"].alt = "Half Orc";
//       mysrc = "halfling.jpg";
//     } else if (mysrc == "halfling.jpg") {
//       document.images["pic"].src = "https://www.worldanvil.com/uploads/images/74d4e06eff04fea0f5208f77a03b37ca.png";
//       document.images["pic"].alt = "halfling";
//       mysrc = "human.jpg";
//     } else {
//       document.images["pic"].src = "https://i.pinimg.com/originals/de/d8/b5/ded8b5be5f1712e3633d7d47946295c2.png";
//       document.images["pic"].alt = "Human";
//       mysrc = "dwarf.jpg";
//     }
//   }

//  ----------CAROUSELS -----------------

$(document).ready(function () {
    let selectedRace;
    let selectedClass;
    const getCharId = () => {
        let url = window.location.href;
        url = url.split('/');
        return url[url.length - 1];
    }

    const charId = getCharId();

    $("#myCarousel").on("slide.bs.carousel", function (e) {
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

    $(".form-check-input").click(function () {
        const selection = $(this)[0].parentElement.innerText;
        let query = this.name
        if (query === "race") {
            selectedRace = selection;
        } else {
            selectedClass = selection;
        }
    })

    const rangeSlider = function () {
        const slider = $('.range-slider'),
            range = $('.range-slider__range'),
            value = $('.range-slider__value');

        slider.each(function () {

            value.each(function () {
                const value = $(this).prev().attr('value');
                $(this).html(value);
            });

            range.on('input', function () {
                $(this).next(value).html(this.value);
            });
        });
    };

    $("#createButton").click(() => {
        let postingDone = false;
        console.log(selectedRace, selectedClass);
        $.get(`/racialTraits/${selectedRace}`).then(traits => {
            $.post(`/api/${charId}`, {raceName: selectedRace, class: selectedClass, traits: JSON.stringify(traits)}).then(() => {
                postingDone = true;
            });
        });
        const waitForPosting = setInterval(function () {
            if (postingDone) {
                clearInterval(waitForPosting);
                window.location.pathname = `/editor/${charId}`;
            }
        }, 100);
    })

    rangeSlider();

});
