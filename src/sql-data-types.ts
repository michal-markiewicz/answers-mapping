type Visits = Visit[];
interface Visit {
  answer_selections: AnswerSelections[];
  trigger_parameters: TriggerParameters;
  locale: string;
  count: string;
}

interface TriggerParameters {
  fully_matching: Product[];
  partially_matching: Product[];
}

interface Product {
  product_id: string;
  checksum: string;
  collection_id: number;
  name: string;
  sku: string;
  picture: string;
  offer_url: string;
  price: number;
}

interface AnswerSelections {
  question_id: number;
  question_origin: number;
  question_type: string;
  selected_answers: SelectedAnswer[];
}

interface SelectedAnswer {
  answer_id: number;
  answer_origin: number;
  low_value?: number;
  high_value?: number;
}

type AnswerMappings = AnswerMapping[];
interface AnswerMapping {
  answer_origin: string;
  answer_text: string;
}

type AnswersOrigins = number[][];

export { AnswerMapping, AnswerMappings, AnswerSelections, AnswersOrigins, SelectedAnswer, Visit, Visits };
