import { React, Page, NestedViewList, View, BackButton, List, Router } from 'reapp-kit';

var {Link} = Router;

export default class extends Page {
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 我 </BackButton>;

    var child = this.hasChildRoute() && this.createChildRouteHandler() || null;
    var viewListProps = this.routedViewListProps();

    return (
      <View {...this.props}>
        <NestedViewList {...viewListProps}>
          <View title={[
            backButton,
            '我的工资'
          ]}>
            <List>
              <List.Item
                title="已支付"
                titleAfter={<span>1000 元</span>}
                wrapper={<Link to="sub1" />}
                icon
                nopad
              />
              <List.Item
                title="待支付"
                titleAfter={<span>4000 元</span>}
                wrapper={<Link to="sub1" />}
                icon
                nopad
              />
              <List.Item
                title="提现"
                wrapper={<Link to="sub1" />}
                icon
                nopad
              />
            </List>
          </View>
          {child}
        </NestedViewList>
      </View>
    );
  }
}

