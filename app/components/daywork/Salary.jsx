import { React, Page, NestedViewList, View, BackButton, List, store } from 'reapp-kit';

export default store.cursor(['profile'], class extends Page {
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 我 </BackButton>;

    var child = this.hasChildRoute() && this.createChildRouteHandler() || null;
    var viewListProps = this.routedViewListProps();

    let profile = this.props.profile.toJSON();

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
                titleAfter={(profile.paidOffline + profile.paidOnline) + ' 元'}
                nopad
              />
              <List.Item
                title="待支付"
                titleAfter={profile.unpaid + ' 元'}
                nopad
              />
            </List>
          </View>
          {child}
        </NestedViewList>
      </View>
    );
  }
});
