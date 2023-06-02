import {
	LazyLoadImage,
	type LazyLoadImageProps,
} from 'react-lazy-load-image-component'

function Image({ width, height, ...props }: LazyLoadImageProps) {
	return (
		<LazyLoadImage {...props} width={width} height={height} effect="blur" />
	)
}

export default Image
