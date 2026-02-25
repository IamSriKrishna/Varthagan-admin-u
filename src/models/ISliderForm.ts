export interface ISliderForm {
  name: string;
  public_url: string;
  html_text: string;
  id: string;
  call_back_link: string;
  order: number | string;
  active: boolean | string;
}

export interface ISliderFormSubmit {
  name?: string;
  public_url?: string;
  html_text?: string;
  call_back_link?: string;
  order?: number;
  active: boolean;
}
