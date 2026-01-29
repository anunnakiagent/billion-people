declare module 'react-simple-maps' {
  import { ReactNode, SVGProps } from 'react';

  export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    children?: ReactNode;
    projection?: string | any;
    projectionConfig?: any;
    width?: number;
    height?: number;
  }

  export interface GeographiesProps {
    children: (props: { geographies: any[] }) => ReactNode;
    geography?: string | object;
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: any;
    onClick?: (geo: any) => void;
    onMouseEnter?: (geo: any) => void;
    onMouseLeave?: (geo: any) => void;
    style?: {
      default?: any;
      hover?: any;
      pressed?: any;
    };
  }

  export interface MarkerProps extends SVGProps<SVGGElement> {
    coordinates: [number, number];
    children?: ReactNode;
  }

  export interface ZoomableGroupProps extends SVGProps<SVGGElement> {
    children?: ReactNode;
    zoom?: number;
    center?: [number, number];
  }

  export interface AnnotationProps {
    subject: [number, number];
    dx?: number;
    dy?: number;
    children?: ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
  export const Annotation: React.FC<AnnotationProps>;
}
