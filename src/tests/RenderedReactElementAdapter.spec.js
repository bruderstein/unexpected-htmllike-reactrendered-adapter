import '../testHelpers/emulateDom';
import RenderedReactElementAdapter from '../RenderedReactElementAdapter';
import GlobalHook from 'react-render-hook';
import Unexpected from 'unexpected';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

const expect = Unexpected.clone();

const Simple = React.createClass({
    render() {
        return (
            <span id={this.props.id}>{this.props.text}</span>
        );
    }
});

const TestComponent = React.createClass({
    render() {
        return (
            <div className="test">
                <Simple id="1" text="one" />
                <Simple id="2" text="two" />
            </div>
        );
    }

});

describe('RenderedReactElementadapter', () => {

    let component;
    let adapter;
    beforeEach(() => {

        adapter = new RenderedReactElementAdapter();
        const renderedComponent = TestUtils.renderIntoDocument(<TestComponent className="foo" />)

        component = GlobalHook.findComponent(renderedComponent);
    });

    it('finds the name of the rendered component', () => {
        expect(adapter.getName(component), 'to equal', 'TestComponent');
    });

    it('finds the div child of the top level component', () => {
        expect(adapter.getChildren(component), 'to have length', 1);
    });

    it('finds the attributes of the top level component', () => {

        expect(adapter.getAttributes(component), 'to equal', {
            className: 'foo'
        });
    });

    describe("component's children", () => {
        let children;

        beforeEach(() => {

            children = adapter.getChildren(component);
        });

        it('finds the name of the native child element of the main component', () => {
            expect(adapter.getName(children[0]), 'to equal', 'div');
        });

        it('finds the children of the native child element of the main component', () => {
            expect(adapter.getChildren(children[0]), 'to have length', 2);
        });

        describe("'s children", () => {

            let grandchildren;
            beforeEach(() => {

                grandchildren = adapter.getChildren(children[0]);
            });


            it('finds the name of the custom component as a grandchild of the main component', () => {
                expect(adapter.getName(grandchildren[0]), 'to equal', 'Simple');
            });

            it('finds the attributes of the custom component as a grandchild of the main component', () => {
                expect(adapter.getAttributes(grandchildren[0]), 'to equal', {
                    id: '1',
                    text: 'one'
                });
                expect(adapter.getAttributes(grandchildren[1]), 'to equal', {
                    id: '2',
                    text: 'two'
                });
            });

            describe('rendered children of rendered custom component', () => {

                let greatgrandchildren;
                let greatgrandchildren2;

                beforeEach(() => {

                    greatgrandchildren = adapter.getChildren(grandchildren[0]);
                    greatgrandchildren2 = adapter.getChildren(grandchildren[1]);
                });

                it('finds the name of the greatgrandchildren', () => {

                    expect(adapter.getName(greatgrandchildren[0]), 'to equal', 'span');
                    expect(adapter.getName(greatgrandchildren2[0]), 'to equal', 'span');
                });

                it('finds the attributes of the greatgrandchildren', () => {

                    expect(adapter.getAttributes(greatgrandchildren[0]), 'to equal', { id: '1' });
                    expect(adapter.getAttributes(greatgrandchildren2[0]), 'to equal', { id: '2' });
                });

                it('returns the text content of the greatgrandchildren', () => {

                    expect(adapter.getChildren(greatgrandchildren[0]), 'to equal', [ 'one' ]);
                    expect(adapter.getChildren(greatgrandchildren2[0]), 'to equal', [ 'two' ]);
                });
            });
        });
    });


    describe('text content', () => {

        let SingleContentComponent, DualContentComponent, MultiContentComponent, MixedContentComponent;
        beforeEach(() => {

            MultiContentComponent = React.createClass({
                render() {

                    return (
                        <button>
                            Button clicked {this.props.count} times
                        </button>
                    )
                }
            });

            SingleContentComponent = React.createClass({
                render() { return ( <div>{this.props.content}</div> ) }
            });

            DualContentComponent = React.createClass({
                render() { return ( <div>{this.props.content1}{this.props.content2}</div> ) }
            });

            MixedContentComponent = React.createClass({
                render() { return ( <div>{this.props.content1}<span>centre</span>{this.props.content2}</div> ) }
            });

            const renderedComponent = TestUtils.renderIntoDocument(<MultiContentComponent count={10} />);
            component = GlobalHook.findComponent(renderedComponent);
        });



        it('renders the text individually', () => {
            const button = adapter.getChildren(component)[0];
            const children = adapter.getChildren(button);
            expect(children, 'to equal', [ 'Button clicked ', '10', ' times' ]);
        });

        it('concatenates the text when concatTextContent option is set', () => {

            adapter.setOptions({ concatTextContent: true });
            const button = adapter.getChildren(component)[0];
            const children = adapter.getChildren(button);
            expect(children, 'to equal', [ 'Button clicked 10 times' ]);
        });

        it('ignores content with null ', () => {

            const renderedComponent = TestUtils.renderIntoDocument(<MultiContentComponent count={null} />);
            component = GlobalHook.findComponent(renderedComponent);
            const button = adapter.getChildren(component)[0];
            const children = adapter.getChildren(button);
            expect(children, 'to equal', [ 'Button clicked ', ' times' ]);
        });

        it('concatenates content with null when concatTextContent is true', () => {

            const renderedComponent = TestUtils.renderIntoDocument(<MultiContentComponent count={null} />);
            component = GlobalHook.findComponent(renderedComponent);
            adapter.setOptions({ concatTextContent: true });
            const button = adapter.getChildren(component)[0];
            const children = adapter.getChildren(button);
            expect(children, 'to equal', [ 'Button clicked  times' ]);
        });

        it('returns a single content item as the original type', () => {

            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<SingleContentComponent content={42} />));

            const theDiv = adapter.getChildren(component)[0];
            expect(adapter.getChildren(theDiv), 'to satisfy', [ 42 ]);
        });

        it('returns a single content item as a string when using `convertToString:true`', () => {

            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<SingleContentComponent content={42} />));
            adapter.setOptions({ convertToString: true })
            const theDiv = adapter.getChildren(component)[0];
            expect(adapter.getChildren(theDiv), 'to satisfy', [ '42' ]);
        });

        it('returns the two content items as strings', () => {

            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<DualContentComponent content1={42} content2={43} />));

            const theDiv = adapter.getChildren(component)[0];
            expect(adapter.getChildren(theDiv), 'to satisfy', [ '42', '43' ]);
        });

        it('returns the 2 content items in mixed children as strings', () => {

            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<MixedContentComponent content1={42} content2={43} />));

            const theDiv = adapter.getChildren(component)[0];
            expect(adapter.getChildren(theDiv), 'to satisfy', [ '42', expect.it('to be an', 'object'), '43' ]);
        });

        it('has the correct classAttributeName property', () => {

            expect(adapter.classAttributeName, 'to equal', 'className');
        });

        it('returns numerical content as a string when convertToString is true', () => {

            const TestComponent = React.createClass({
                render() {
                    return <div>{42}</div>;
                }
            });

            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<TestComponent />));
            const theDiv = adapter.getChildren(component)[0];
            adapter.setOptions({ convertToString: true })
            expect(adapter.getChildren(theDiv), 'to satisfy', [ '42' ])
        });

        it('returns concatenates numerical content when convertToString and concatTextContent is true', () => {

            const TestComponent = React.createClass({
                render() {
                    return <div>{4}{2}</div>;
                }
            });

            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<TestComponent />));
            const theDiv = adapter.getChildren(component)[0];
            adapter.setOptions({ convertToString: true, concatTextContent: true });
            expect(adapter.getChildren(theDiv), 'to satisfy', [ '42' ])
        });

        it('ignores null content with numerical children when concatenating', () => {

            const TestComponent = React.createClass({
                render() {
                    return <div>{4}{null}</div>;
                }
            });

            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<TestComponent />));
            const theDiv = adapter.getChildren(component)[0];
            adapter.setOptions({ convertToString: true, concatTextContent: true });
            expect(adapter.getChildren(theDiv), 'to satisfy', [ '4' ])
        });
        
        it('ignores null content with numerical children when not concatenating', () => {

            const TestComponent = React.createClass({
                render() {
                    return <div>{4}{null}</div>;
                }
            });
 
            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<TestComponent />));
            const theDiv = adapter.getChildren(component)[0];
            adapter.setOptions({ convertToString: true });
            expect(adapter.getChildren(theDiv), 'to satisfy', [ '4' ])
        });
        
        it('treats a zero as a normal number', () => {

            const TestComponent = React.createClass({
                render() {
                    return <div>Hello {0}</div>;
                }
            });

            const component = GlobalHook.findComponent(TestUtils.renderIntoDocument(<TestComponent />));
            const theDiv = adapter.getChildren(component)[0];
            adapter.setOptions({ convertToString: true });
            expect(adapter.getChildren(theDiv), 'to satisfy', [ 'Hello ', '0' ])
        });

    });
});
