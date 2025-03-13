gsap.registerPlugin(ScrollTrigger);
// let scroll;
gsap.config({
  nullTargetWarn: false,
});

const body = document.body;
const select = (e) => document.querySelector(e);
const selectAll = (e) => document.querySelectorAll(e);
//const container = select('.site-main');
const loader = select('.js-loader');
const loaderInner = select('.js-loader__inner');
const progressBar = select('.js-loader__progress');
const loaderMask = select('.js-loader__mask');

// show loader on page load
gsap.set(loader, {autoAlpha: 1});

// scale loader down
gsap.set(loaderInner, {scaleY: 0.005, transformOrigin: 'bottom'});


initPageTransitions();

function pageTransitionIn({container}) {
  // timeline to stretch the loader over the whole screen
  const tl = gsap.timeline({
    defaults: {
      duration: 1,
      ease: 'power2.inOut'
    }
  });
  tl
  .set(loaderInner, { autoAlpha: 0 })
  .fromTo(loader, { yPercent: -100 }, {yPercent: 0 })
  .fromTo(loaderMask, { yPercent: 80 }, {yPercent: 0 }, 0)
  .to(container, { y: 100}, 0);
  return tl;
}

function pageTransitionOut({ container }) {
  // timeline to move loader away down
  const tl = gsap.timeline({
    defaults: {
      duration: 1,
      ease: 'power2.inOut',
    },
    onComplete: () => initScript(),
  });
  tl.to(loader, { yPercent: 100 })
    .to(loaderMask, { yPercent: -80 }, 0)
    .from(container, { y: -150, clearProps: "transform"}, 0);
  return tl;
}

function initPageTransitions() {

  //let scroll;

  // do something before the transition starts
  barba.hooks.before(() => {
    select('html').classList.add('is-transitioning');
    select('.cb-cursor').classList.remove('-visible');
    // scroll.refresh();
  });

  // do something after the transition finishes
  barba.hooks.after(() => {
    select('html').classList.remove('is-transitioning');
    select('.cb-cursor').classList.add('-visible');
    // reinit locomotive scroll
    // scroll.refresh();
  });

  // scroll to the top of the page
  barba.hooks.enter(() => {
    window.scrollTo(0, 0);
  });

  barba.init({
    sync:true,
    debug: true,
    timeout:7000,
    preventRunning: true,
    transitions: [{
      name: 'overlay-transition',
      beforeOnce(data) {
        console.log('beforeOnce')
        initSmoothScroll(data.next.container);
      },
      once(data) {
        // do something once on the initial page load
        initLoader();
      },
      async leave(data) {
        // animate loading screen in
        pageTransitionIn(data.current);
        await delay(1000);
        data.current.container.remove();
      },
      async beforeEnter(data) {
        ScrollTrigger.getAll().forEach(t => t.kill());
        scroll.destroy();
        initSmoothScroll(data.next.container);
      },
      // async afterEnter(data){
      //   addEvents();
      // },
      async enter(data) {
        // animate loading screen away
        pageTransitionOut(data.next);
      },
    }]
  });

  function initSmoothScroll(container) {
    scroll = new LocomotiveScroll({
      el: container.querySelector('[data-scroll-container]'),
      smooth: true,
      lerp: .05,
      getDirection: true,
      // direction: 'horizontal',
      // multiplier: .3,
    });

    scroll.on('scroll', ScrollTrigger.update);

    ScrollTrigger.scrollerProxy('[data-scroll-container]', {
      scrollTop(value) {
        return arguments.length
          ? scroll.scrollTo(value, 0, 0)
          : scroll.scroll.instance.scroll.y;
      }, // we don't have to define a scrollLeft because we're only scrolling vertically.
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
      pinType: container.querySelector('[data-scroll-container]').style
        .transform
        ? 'transform'
        : 'fixed',
    });

    /**
     * Remove Old Locomotive Scrollbar
     */

    const scrollbar = selectAll('.c-scrollbar');

    if (scrollbar.length > 1) {
      //scrollbar[0].remove();
    }

    // each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll.
    ScrollTrigger.addEventListener('refresh', () => scroll.update());

    // after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
    ScrollTrigger.refresh();
  }
}


function initLoader() {
  const tlLoaderIn = gsap.timeline({
    id: 'tlLoaderIn',
    defaults: {
      duration: 1.1,
      ease: 'power2.out',
    },
    onComplete: () => initScript(),
  });

  tlLoaderIn
    //.set(loaderContent, {autoAlpha: 1})
    .to(loaderInner, {
      scaleY: 1,
      transformOrigin: 'bottom',
      ease: 'power1.inOut',
    });

  const tlLoaderOut = gsap.timeline({
    id: 'tlLoaderOut',
    defaults: {
      duration: 1.2,
      ease: 'power2.inOut',
    },
    delay: 1,
    onUpdate: function () {
      ScrollTrigger.refresh();
    },
  });

  tlLoaderOut
    .to(loader, { yPercent: -100 }, 0.2)
    .from('.site-main', { y: 150, clearProps: "transform" }, 0.2);

  const tlLoader = gsap.timeline();
  tlLoader.add(tlLoaderIn).add(tlLoaderOut);
  
}

function delay(n) {
  n = n || 3000;
  return new Promise((done) => {
    setTimeout(() => {
      done();
    }, n);
  });
}

function enterText() {
let sections = gsap.utils.toArray(".panel");

let scrollTween = gsap.to(sections, {
    xPercent: -100 * (sections.length - 1),
    ease: "none", // <-- IMPORTANT!
    scrollTrigger: {
      trigger: ".container2",
      pin: true,
      scrub: true,
      scroller: '.scroll-container',
      //snap: directionalSnap(1 / (sections.length - 1)),
      end: "+=3000"
    }
  });

// img reveal
let revealContainers = document.querySelectorAll(".reveal");

revealContainers.forEach((container, i) => {
  let image = container.querySelector("img");
  
  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      containerAnimation: scrollTween,
      start: "center center",
      toggleActions: "restart none none reset",
      scrub:true,
    }
  });

  tl.set(container, { autoAlpha: 1 });
  tl.from(container, 1.5, {
    xPercent: -100,
    ease: "power2"
  });
  tl.from(image, 1.5, {
    xPercent: 100,
    scale: 1.3,
    delay: -1.5,
    ease: "power2"
  });
  ScrollTrigger.refresh();
});}



/**
 * Fire all scripts on page load
 */
function initScript() {
  select('body').classList.remove('is-loading');
  Stuck();
  enterText();
  initImageParallax();
  FadeUp();
  Clip();
  accordion();
  pop();
  alternativeparallax();
  animateMarquee();
  hideheader();
  // Headings();
}

// function enterText() {
//   const enter1 = document.querySelector('.enter-text1');
//   const enter2 = document.querySelector('.enter-text2');
//   let enterText = gsap.timeline({
//     scrollTrigger: {
//       trigger: '.enter',
//       start: 'top top',
//       end: '+=120%',
//       scrub: 1,
//       scroller: '.scroll-container',
//       ease: 'power1.inOut',
//       pin: '.enter',
//       // pinSpacing: false,
//     },
//   });
//   enterText.from(enter1, {
//     y: -500,
//     scale: 2,
//   });
//   enterText.from(enter2, {
//     y: 500,
//     scale: 2,
//     delay:0,
//   });
//   ScrollTrigger.refresh();
// }

function Stuck() {
  const button = document.querySelector('.circle');
  let stuck = gsap.timeline({
    scrollTrigger: {
      trigger: '.firme',
      start: 'top top',
      scrub: 1,
      scroller: '.scroll-container',
      ease: 'power1.inOut',
      pin: true,
      // pinSpacing: false,
    },
  });
  stuck.fromTo('.f-stanga', {
    x: '-40vw',
  },{
    x: 0,
  });
  stuck.fromTo('.f-dreapta', {
    x: '40vw',
  },{
    x: 0,
  },'<');
  stuck.fromTo('.f-img', {
    scale: .1,
  },{
    scale: 1,
  },'<');
  ScrollTrigger.refresh();
}

const pop = () => {
  const contact = document.querySelector('.contact');
  const contactpop = document.querySelector('.contact-pop')
  const contact2 = document.querySelectorAll('.contact2');
  const close = document.querySelector('.close');
  const shadow =document.querySelector('.shadow');
  const pop = gsap.timeline({paused:true, reversed:true});

  pop.fromTo(contactpop,{scaleX: 0},{scaleX: 1, ease: 'power3.inOut', duration: 1})
  // pop.to('#main',{opacity: .3},'<')
  pop.fromTo('nav',{opacity: 1},{opacity: 0},'<')
  pop.fromTo('.shadow',{display:'none'},{display:'block', delay:.5},'<')
  // pop.fromTo(form,{opacity: 0,y:30},{opacity: 1,y:0})
  pop.fromTo(".input-big, .inputs, .message_error, .full, .social li", {opacity: 0, y: 20},{opacity: 1,y:0, stagger: { amount: .2 }})
  pop.fromTo('.close',{opacity: 0,y:-30},{opacity: 1,y:0},'<')


  contact.addEventListener('click', () =>{
    pop.play();
  })
  contact2.forEach(contact2 => {
    if(contact2){
    contact2.addEventListener('click', () =>{
      pop.play();
    })}
    })
  close.addEventListener('click', () =>{
    pop.reverse();
  })
  shadow.addEventListener('click', () =>{
    pop.reverse();
  })
}

//mobile
// const mobilemenu = () => {
//   const toggle = document.querySelector('.togglet');
//   const menu = document.querySelector('.mobile');
//   const link = document.querySelectorAll('.newpage');
//   const mobilemen = gsap.timeline({paused:true, reversed:true});

//   mobilemen.fromTo(menu,{scaleY: 0},{scaleY: 1, ease: 'power3.inOut', transformOrigin:"top", duration: .7}),
//   mobilemen.fromTo(link,{y: '100%'},{y:'0%', ease: 'power4.inOut', delay: 0, duration:.7, stagger: { amount: .2 }}),


//   toggle.addEventListener('click', () =>{
//     mobilemen.reversed() ? mobilemen.timeScale(1).play() : mobilemen.timeScale(2).reverse();
//   }),
//   link.forEach (link => {
//   link.addEventListener('click', () =>{
//     mobilemen.reversed() ? mobilemen.timeScale(1).play() : mobilemen.timeScale(2).reverse();});
//   })
// }


//initPageTransitions();
function FadeUp(){
let images = gsap.utils.toArray('.fadeup')

images.forEach((item, index) => {

  let exptl = gsap.timeline({
    scrollTrigger: {
      trigger: item,
      start: "top bottom",
      end: "top 80%",
      scrub: 1,
      scroller: '.scroll-container',
      ease: 'power3.inOut',
    }
  });
  exptl.from(item, {
    autoAlpha: 0,
    y:50,
  });
});}

function Headings(){
  let headings = gsap.utils.toArray('.xl-heading')
  
  headings.forEach((item, index) => {
  
    let headhide = gsap.timeline({
      scrollTrigger: {
        trigger: 'xl',
        start: "top 20%",
        end: "top top",
        scrub: 1,
        scroller: '.scroll-container',
        ease: 'power3.inOut',
        markers:true,
      }
    });
    headhide.to(item, {
      y:'-100%',
    });
  });}
  


function Clip(){
  let images = gsap.utils.toArray('.clip')
  
  images.forEach((item, index) => {
  
    let exptl3 = gsap.timeline({
      scrollTrigger:{
        trigger: item,
        start: "top bottom",
        end: "top 70%",
        scrub: true,
        scroller: '.scroll-container',
        ease: 'power2.out',
      }
    });
    exptl3.from(item, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      duration: 1,
    });
  });}

  function alternativeparallax() {
  let postsSection = document.querySelector('#featured-posts')
  gsap.to("[data-speed]", {
    y: (i, el) => (-1 * parseFloat(el.getAttribute("data-speed"))) * (postsSection.offsetHeight / 3),
    ease: "power2.inOut",
    duration: 1,
    scrollTrigger: {
      trigger:postsSection,
      scroller: '.scroll-container',
      invalidateOnRefresh: true,
      scrub: 3,
      // markers: true,
      start: 'top bottom',
    }
  });
}




// function hideheader() {
// const showAnim = gsap.from('header', { 
//   yPercent: -100,
//   paused: false,
//   duration: .8,
//   ease: 'power2.inOut',
// }).progress(1);

// ScrollTrigger.create({
//   start: "10% top",
//   end: 99999,
//   scroller: '.scroll-container',
//   // markers:true,
//   onUpdate: (self) => {
//     self.direction === -1 ? showAnim.play() : showAnim.reverse()
//   }
// });}

 function initImageParallax() {
    // select all sections .with-parallax
    gsap.utils.toArray('.is-parallax').forEach(section => {
  
      // get the elements
      const image = section.querySelector('.c-gallery__src');
      const line = section.querySelector('.dreapta');
      const opus = section.querySelector('.opus');
      const linie = section.querySelectorAll('.line');
      const cezar =section.querySelectorAll('.inset');
      const colab =section.querySelector('.colabo');
      const scrollrev =section.querySelector('.fixed');

      // gsap.to(colab, {
      //   clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 0)",
      //   ease: 'power2.inOut',
      //   scrollTrigger: {
      //     trigger: '.colab-text',
      //     scroller: '.scroll-container',
      //     start: 'top bottom',
      //     end: '+=500',
      //     // markers:true,clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
      //     scrub: true,
      //   }
      // });

            // create tween 
            gsap.from(line,{
              x:'-1em',
          });
            gsap.to(line, {
              x: '1em',
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: '.side-trigger',
                scroller: '.scroll-container',
                start: 'top bottom',
                scrub: 0.3,
                // markers:true,
              }
            });
      
             gsap.from(opus,{
                 x:'1em',
             });
            gsap.to(opus, {
              x: '-1em',
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: '.side-trigger',
                scroller: '.scroll-container',
                start: 'top bottom',
                scrub: 0.3,
              }
            });


      gsap.to(cezar, {
        clipPath: "inset(0%)",
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: section,
          scroller: '.scroll-container',
          start: 'top center',
          end: '+=100%',
          scrub: true,
          // pin:true,
          // pinSpacer:false,
        }
      });
      
      gsap.from(linie, {
        width: '10%',
        ease: 'power2.inOut',
        transformOrigin: '0%',
      });
      gsap.to(linie, {
        width: '100%',
        transformOrigin: 'left',
        scrollTrigger: {
          trigger: section,
          scroller: '.scroll-container',
          start: 'top bottom',
          end: '+=40%',
          scrub:0.5,
          // markers:true,
        }
      });


      // create tween 
      gsap.to(image, {
        scaleX: 1.1,
        scaleY:1.1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: section,
          scroller: '.scroll-container',
          start: 'top bottom',
          scrub: 1,
          force3D:false,
        }
      });



    });
  }
  function animateMarquee() {

    const marquee = document.querySelectorAll('.cb-marquee');

marquee.forEach((e) => {

    // Create swiper carousel
    const carousel = e.querySelectorAll('.cb-marquee-carousel');

    carousel.forEach((e) => {
        const items = e.querySelector('.cb-marquee-items');
        const item = e.querySelectorAll('.cb-marquee-item');

        e.classList.add('swiper-container');
        items.classList.add('swiper-wrapper');
        item.forEach(e => e.classList.add('swiper-slide'));

        const slider = new Swiper(e, {
            slidesPerView: 'auto',
            loop: true,
            freeMode: true,
            freeModeMomentumBounce: true,
            freeModeMomentumVelocityRatio: 1
        });
    });

    // Scroll triggered movement
    const tl = new gsap.timeline();

    tl.set(carousel, {willChange: "transform"});

    tl.fromTo(carousel[0], {
        x: -500
    }, {
        x: 0,
        ease: "none"
    }, 0);

    tl.fromTo(carousel[1], {
        x: 500
    }, {
        x: 0,
        ease: "none"
    }, 0);

    tl.set(carousel, {willChange: "auto"});

    ScrollTrigger.create({
        trigger: e,
        scroller: '.scroll-container',
        animation: tl,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.3,
        refreshPriority: -14,
    })
});
}

const navSlide = () => {
    const burger = document.querySelector('.burger');
    const burgerDiv =document.querySelectorAll('.inside');
    const nav = document.querySelector('.curtain');
    const navLinks = document.querySelectorAll('.navlinks li');
    const logo = document.querySelector('#Layer_1')
    const navigation = document.querySelector('.navlinks')
    burger.addEventListener('click', function (event) {
        nav.classList.toggle('nav-active');
        
        navLinks.forEach ((link, index) => {
            if (link.style.animation){
                link.style.animation = ''
            } else{
                link.style.animation = `navLinkFade .5s ease forwards ${index /12 + 0.1}s`;
            }
        });
        burger.classList.toggle('toggle');
        logo.classList.toggle('invert');  
        navigation.classList.toggle('activelinks');
        burgerDiv.forEach(function (burgerDiv){burgerDiv.classList.toggle('invert2')});
    });

}
navSlide();


const navSlideout = () => {
    const burger = document.querySelector('.burger');
    const burgerDiv =document.querySelectorAll('.inside');
    const nav = document.querySelector('.curtain');
    const navLinks = document.querySelectorAll('.navlinks li');
    const logo = document.querySelector('#Layer_1')
    const link1 = document.querySelector('.navlink1');
    const link2 = document.querySelector('.navlink2');
    const link3 = document.querySelector('.navlink3');
    const navigation = document.querySelector('.navlinks')


    link1.addEventListener('click',()=>{
      burger.classList.toggle('toggle');
      logo.classList.toggle('invert');  
      burgerDiv.forEach(function (burgerDiv){burgerDiv.classList.toggle('invert2')});
      nav.classList.toggle('nav-active');
      navigation.classList.remove('activelinks');
        navLinks.forEach ((link, index) => {
            if (link.style.animation){
                link.style.animation = ''
            } else{
                link.style.animation = `navLinkFade .1s ease forwards ${index /12 + 0.1}s`;
            }
        });
    });
    link2.addEventListener('click',()=>{
      burger.classList.toggle('toggle');
      logo.classList.toggle('invert');  
      burgerDiv.forEach(function (burgerDiv){burgerDiv.classList.toggle('invert2')});
      nav.classList.toggle('nav-active');
      navigation.classList.remove('activelinks');
        navLinks.forEach ((link, index) => {
            if (link.style.animation){
                link.style.animation = ''
            } else{
                link.style.animation = `navLinkFade .1s ease forwards ${index /12 + 0.1}s`;
            }
        });
    });
    link3.addEventListener('click',()=>{
        burger.classList.toggle('toggle');
        logo.classList.toggle('invert');  
        burgerDiv.forEach(function (burgerDiv){burgerDiv.classList.toggle('invert2')});
        nav.classList.toggle('nav-active');
        navigation.classList.remove('activelinks');
        navLinks.forEach ((link, index) => {
            if (link.style.animation){
                link.style.animation = ''
            } else{
                link.style.animation = `navLinkFade .1s ease forwards ${index /12 + 0.1}s`;
            }
        });
    });
}
navSlideout();

function accordion(){
gsap.set('.faq--answer', { autoAlpha: 0, height: 0 });
gsap.set('.iconV, .iconH', {transformOrigin: '50% 50%'});

let faqs = gsap.utils.toArray(".faq");

faqs.forEach(faq => {
  let answer = faq.querySelector('.faq--answer');
  let title = faq.querySelector('.faq--title');
  let iconV = faq.querySelector('.iconV');
  let iconH = faq.querySelector('.iconH');
  
  //assign as variable
  let tl = gsap.timeline({ paused: true });
  
  tl.to(faq, { duration: .1, backgroundColor: '#EBEBEB' })
    .to(answer, { duration: .25, autoAlpha: 1, height: 'auto' }, "<-=.1")
    .to(iconV, { duration: .2, rotate: 135 }, '-=.15')  
    .to(iconH, { duration: .2, rotate: -42.5 }, '-=.15'); 
  
  //start timeline resting in reversed state
  tl.reverse()
  
  faq.addEventListener("click", () => {
    //toggle reversed property of my timeline
    tl.reversed(!tl.reversed())
  })

})}


// removed resize mobile
ScrollTrigger.config({
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
})
// window resize
const resize = e => {
  Xt.eventDelay({
    e,
    ns: 'xtScrolltriggerRerfreshFix',
    func: () => {
      ScrollTrigger.refresh()
    },

  })
}
removeEventListener('resize', resize)
// addEventListener('resize', resize)


// Dark Mode
// const darkmode = gsap.timeline({paused:true, reversed:true});
// darkmode.to('html',{"--black": "rgb(255, 255, 255)", "--white": "#FFF", "--soft-d": "#f2f2f2", "--darkest": "#fff","--soft":"#b2b2b2", duration: .3, ease: 'power3.inOut'})
// darkmode.to('.innertoggle', {translateX: 15, duration: .3, ease: 'power3.inOut'},'<')
// const darktoggle = document.querySelector('.dark2')

// darktoggle.addEventListener('click', () =>{
//   darkmode.reversed() ? darkmode.play() : darkmode.reverse();
// })


// if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//   // dark mode
//   darkmode.play();
// }

