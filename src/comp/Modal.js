import { useState, useEffect, useCallback, useRef } from "react";
import socketIO from "socket.io-client";
const socket = socketIO.connect("http://localhost:4000");

const Modal = ({ url }) => {
    const ref = useRef(null);
    const [image, setImage] = useState("");
    const [cursor, setCursor] = useState("");
    const [fullHeight, setFullHeight] = useState("");
    const [p, setP] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (url.includes('bard')) {
            socket.emit("browseBard", {
                url,
            });

        } else {
            socket.emit("browse", {
                url,
            });
        }

        /*
        👇🏻 Listens for the images and full height 
             from the PuppeteerMassScreenshots.
           The image is also converted to a readable file.
        */
        socket.on("image", ({ img, fullHeight }) => {
            setImage("data:image/jpeg;base64," + img);
            setFullHeight(fullHeight);
        });

        socket.on("cursor", (cur) => {
            setCursor(cur);
        });


        const keyDownHandler = event => {
            console.log('User pressed: ', event.key);
            socket.emit('keypress', { x: p.x, y: p.y, k: event.key });
            if (event.key === 'Enter') {
                // event.preventDefault();
            }
        };
        document.addEventListener('keydown', keyDownHandler);
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };


    }, [url]);


    const mouseMove = useCallback((event) => {
        const position = event.currentTarget.getBoundingClientRect();
        const widthChange = 1255 / position.width;
        const heightChange = 800 / position.height;

        socket.emit("mouseMove", {
            x: widthChange * (event.pageX - position.left),
            y:
                heightChange *
                (event.pageY - position.top - document.documentElement.scrollTop),
        });
    }, []);

    const mouseScroll = useCallback((event) => {
        const position = event.currentTarget.scrollTop;
        socket.emit("scroll", {
            position,
        });
    }, []);

    const mouseClick = useCallback((event) => {
        const position = event.currentTarget.getBoundingClientRect();
        const widthChange = 1255 / position.width;
        const heightChange = 800 / position.height;
        setP({
            x: widthChange * (event.pageX - position.left), y: heightChange *
                (event.pageY - position.top - document.documentElement.scrollTop)
        })
        socket.emit("mouseClick", {
            x: widthChange * (event.pageX - position.left),
            y:
                heightChange *
                (event.pageY - position.top - document.documentElement.scrollTop),
        });
    }, []);



    // const keydown = useCallback((event) => {
    //     console.log('Event: + ' + event)
    //     const position = event.currentTarget.getBoundingClientRect();
    //     const widthChange = 1255 / position.width;
    //     const heightChange = 800 / position.height;
    //     socket.emit("keydown", {
    //         x: widthChange * (event.pageX - position.left),
    //         y:
    //             heightChange *
    //             (event.pageY - position.top - document.documentElement.scrollTop),
    //         k: event
    //     });
    // }, []);

    // Event listener for keydown event

    return (
        <div style={{ width: '80%', height: '500px' }} className='popup' onScroll={mouseScroll} >
            <div

                ref={ref}
                className='popup-ref' style={{ height: fullHeight }}>
                {image && <img src={image}

                    onMouseMove={mouseMove}
                    onClick={mouseClick}
                    // onKeyDownCapture={keydown}
                    // onInput={keydown}



                    alt='' />}
            </div>
        </div>
    );
};

export default Modal;