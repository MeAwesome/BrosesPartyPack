import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Flex } from "@react-three/flex";
import { useEffect, useRef, useState } from "react";
import Phone from "@root/app/components/desktop/chronically-online/home/Phone";
import MenuOption from "~/components/desktop/chronically-online/home/MenuOption";
import { useEventListener } from "usehooks-ts";
import { useMenu } from "~/hooks/use-menu";
import Background from "~/components/desktop/chronically-online/home/Background";
import Blob from "~/components/desktop/chronically-online/home/Blob";
import { to, useSpring } from "@react-spring/three";

export default function Home({ loaderData }: { readonly loaderData: any }) {
	const { setMenu } = useMenu();
    const cameraRef = useRef<CameraControls>(null);
	const [selectedOption, setSelectedOption] = useState(0);
	const [freezeSelection, setFreezeSelection] = useState(false);
    const camera = useThree((state) => state.camera);
    const [ phoneState, setPhoneState ] = useState(0);

	const [ backgroundColorSpring ] = useSpring(
		() => ({
			from: {
				color: "#1296E3"
			},
			to: {
				color: "#F26419"
			},
			delay: 5000,
			loop: {
				reverse: true
			},
			config: {
				duration: 5000
			}
		}),
		[]
	);

    const [ phoneColorSpring ] = useSpring(
        () => ({
            from: {
                color : "#F26419"
            },
            to: {
                color : "#1296E3"
            },
            delay: 5000,
            loop: {
                reverse: true
            },
            config: {
                duration: 5000
            }
        }),
        []
    );

	const [backgroundMusic] = useState<Howl>(
		new Howl({
			src: ["/.proxy/audio/music/chronically-online-main-theme.mp3"],
			loop: true
		})
	);

	useEventListener("keydown", (e) => {
		if (e.key == "ArrowDown" && !freezeSelection) {
			setSelectedOption((selectedOption + 1) % 3);
		} else if (e.key == "ArrowUp" && !freezeSelection) {
			setSelectedOption((selectedOption - 1 + 3) % 3);
		} else if (e.key == "Enter" && !freezeSelection) {
			setFreezeSelection(true);
			if (selectedOption == 0) {
                setPhoneState(1);
                setTimeout(() => {
                    cameraRef.current?.moveTo(5, 0, -12, true);
                    cameraRef.current?.rotateTo(Math.PI / 2, Math.PI / 2, true);
                    setSelectedOption(-1);
                }, 2000);
                    
                // camera.rotateY(Math.PI / 2);
			} else if (selectedOption == 1) {
			} else if (selectedOption == 2) {
				backgroundMusic.stop();
				setMenu("main");
			}
		} else if (e.key == "Backspace" && freezeSelection) {
            setPhoneState(0);
            cameraRef.current?.moveTo(0, 0, 0, true).then(() => {
				setSelectedOption(0);
                setFreezeSelection(false);
			});
            cameraRef.current?.rotateTo(0, Math.PI / 2, true)
        }
	});

	useEffect(() => {
		backgroundMusic.play();
		return () => {
			backgroundMusic.stop();
		};
	}, []);

	return (
		<>
			<Background color={backgroundColorSpring.color} />
			<Phone loaderData={loaderData} state={phoneState} color={phoneColorSpring.color} />
			<Blob color={backgroundColorSpring.color} />
			<Flex justifyContent="center" alignItems="flex-end" position={[8, 0, 0]} rotation={[0, -0.4, 0]}>
				<MenuOption option={"PLAY"} selected={selectedOption == 0} loaderData={loaderData} />
				<MenuOption option={"SETTINGS"} selected={selectedOption == 1} loaderData={loaderData} />
				<MenuOption option={"QUIT"} selected={selectedOption == 2} loaderData={loaderData} />
			</Flex>
			<CameraControls camera={camera} ref={cameraRef} />
		</>
	);
}
