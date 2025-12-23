import { EdgeRegexConstant } from "../constants/edge-regex.constanst";
import { NodeRegexConstant } from "../constants/node-regex.constanst";
import { AnnotationsTypeEnum } from "../enums/annotations.enum";

export class TypeAnnotationsService {

 public getAnnotationType (annotation: string): AnnotationsTypeEnum  {
  if (EdgeRegexConstant.edgeAnnotationRegex.test(annotation)) {
    return AnnotationsTypeEnum.EDGE
  } else if (NodeRegexConstant.nodeAnnotationRegex.test(annotation)) {
    return AnnotationsTypeEnum.NODE
  } else {
    return AnnotationsTypeEnum.NONE
  }
}
}