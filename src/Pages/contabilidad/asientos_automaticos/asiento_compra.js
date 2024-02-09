import { Component } from 'react';

import { SHr, SPage, SText, STheme } from 'servisofts-component';
import { connect } from 'servisofts-page';
import Container from '../../../Components/Container';


class index extends Component {
  constructor(props) {
    super(props);

  }

  render() {

    return <>
      <SPage title={"compra"} center backgroundColor={"transparent"}>
        <Container>
          <SText fontSize={36} font={"Roboto"} bold color={STheme.color.text} center>Compras</SText>
          <SHr height={40} />
        </Container>
      </SPage>
    </>
  }
}
export default connect(index);