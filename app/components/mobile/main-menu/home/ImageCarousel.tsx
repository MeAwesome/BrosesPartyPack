import Slider from "react-slick";

export default function ImageCarousel() {
	return (
		<div className="w-full mx-auto max-w-sm">
			<div className="slider-container mb-5">
				<Slider
					dots
					infinite
					speed={500}
					slidesToShow={1}
					slidesToScroll={1}
					autoplay
					centerMode
					pauseOnHover
					swipeToSlide
					adaptiveHeight
					lazyLoad="ondemand"
					arrows={false}
				>
					<img src="/images/moonknight.png" alt="Icon 1" />
					<img src="/images/moonknight.png" alt="Icon 2" />
					<img src="/images/moonknight.png" alt="Icon 3" />
					<img src="/images/moonknight.png" alt="Icon 4" />
					<img src="/images/moonknight.png" alt="Icon 5" />
					<img src="/images/moonknight.png" alt="Icon 6" />
				</Slider>
			</div>
		</div>
	);
}
