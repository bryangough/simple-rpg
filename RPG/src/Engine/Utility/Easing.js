//https://www.reddit.com/r/gamedev/comments/5ba5cs/someone_got_any_cool_portfolios_from_ui/
var Optimized = 
{
    easeLinear      : function(p) { return p;              }, // p^1 Note: In = Out = InOut
    easeInQuad      : function(p) { return p*p;            }, // p^2 = Math.pow(p,2)
    easeInCubic     : function(p) { return p*p*p;          }, // p^3 = Math.pow(p,3)
    easeInQuart     : function(p) { return p*p*p*p;        }, // p^4 = Math.pow(p,4)
    easeInQuint     : function(p) { return p*p*p*p*p;      }, // p^5 = Math.pow(p,5)
    easeInSextic    : function(p) { return p*p*p*p*p*p;    }, // p^6 = Math.pow(p,6)
    easeInSeptic    : function(p) { return p*p*p*p*p*p*p;  }, // p^7 = Math.pow(p,7)
    easeInOctic     : function(p) { return p*p*p*p*p*p*p*p;}, // p^8 = Math.pow(p,8)

    easeOutQuad     : function(p) { var m=p-1; return 1-m*m;             },
    easeOutCubic    : function(p) { var m=p-1; return 1+m*m*m;           },
    easeOutQuart    : function(p) { var m=p-1; return 1-m*m*m*m;         },
    easeOutQuint    : function(p) { var m=p-1; return 1+m*m*m*m*m;       },
    easeOutSextic   : function(p) { var m=p-1; return 1-m*m*m*m*m*m;     },
    easeOutSeptic   : function(p) { var m=p-1; return 1+m*m*m*m*m*m*m;   },
    easeOutOctic    : function(p) { var m=p-1; return 1-m*m*m*m*m*m*m*m; },

    easeInOutQuad   : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t;             return 1-m*m            *  2; },
    easeInOutCubic  : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t;           return 1+m*m*m          *  4; },
    easeInOutQuart  : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t;         return 1-m*m*m*m        *  8; },
    easeInOutQuint  : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t*t;       return 1+m*m*m*m*m      * 16; },
    easeInOutSextic : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t*t*t;     return 1-m*m*m*m*m*m    * 32; },
    easeInOutSeptic : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t*t*t*t;   return 1+m*m*m*m*m*m*m  * 64; },
    easeInOutOctic  : function(p) { var m=p-1,t=p*2; if (t < 1) return p*t*t*t*t*t*t*t; return 1-m*m*m*m*m*m*m*m*128; },

    easeInBack      : function(p) { var              k = 1.70158        ;              return p*p*(p*(k+1) - k);                                        },
    easeInOutBack   : function(p) { var m=p-1,t=p*2, k = 1.70158 * 1.525; if (p < 0.5) return p*t*(t*(k+1) - k); else return 1 + 2*m*m*(2*m*(k+1) + k); },
    easeOutBack     : function(p) { var m=p-1,       k = 1.70158        ;                                             return 1 +   m*m*(  m*(k+1) + k); },

    easeInBounce    : function( p ) {
        return 1 - this.easeOutBounce( 1-p );
    },
    easeInOutBounce : function( p ) {
        var t = p*2;
        if (t < 1) return 0.5 - 0.5*this.easeOutBounce( 1 - t ); // 0.5*EaseInBounce( t ) -> 0.5*(1-Out(1-p))
        return            0.5 + 0.5*this.easeOutBounce( t - 1 );
    },
    easeOutBounce   : function( p ) {
        var r  = 1  / 2.75; // reciprocal
        var k1 = 1     * r; // 36.36%
        var k2 = 2     * r; // 72.72%
        var k3 = 1.5   * r; // 54.54%
        var k4 = 2.5   * r; // 90.90%
        var k5 = 2.25  * r; // 81.81%
        var k6 = 2.625 * r; // 95.45%
        var k0 = 7.5625, t;

        /**/ if (p < k1) {             return k0 * p*p;            }
        else if (p < k2) { t = p - k3; return k0 * t*t + 0.75;     } // 48/64
        else if (p < k4) { t = p - k5; return k0 * t*t + 0.9375;   } // 60/64
        else             { t = p - k6; return k0 * t*t + 0.984375; } // 63/64
    },

    easeInCirc   : function(p){                             return  1-Math.sqrt( 1 - p*p );                                                      },
    easeInOutCirc: function(p){ var m=p-1,t=p*2; if (t < 1) return (1-Math.sqrt( 1 - t*t ))*0.5; else return (Math.sqrt( 1 - 4*m*m ) + 1) * 0.5; },
    easeOutCirc  : function(p){ var m=p-1      ;                                                      return  Math.sqrt( 1 -   m*m );            },


    easeInElastic   : function(p) {
        var m = p-1;
        if (p <= 0) return 0;
        if (p >= 1) return 1;

        return  - Math.pow( 2,10*m  ) * Math.sin( ( m*40 - 3) * Math.PI/6 ); // Note: 40/6 = 6.666... = 2/0.3;
    },

    easeOutElastic  : function(p) { // Alt.: return 1 - this.easeInElastic( 1-p );
        if (p <= 0) return 0;
        if (p >= 1) return 1;

        return 1+(Math.pow( 2,10*-p ) * Math.sin( (-p*40 - 3) * Math.PI/6 ));
    },
    easeInOutElastic: function(p) {
        if (p <= 0) return 0;
        if (p >= 1) return 1;

        var s = 2*p-1;                 // remap: [0,0.5] -> [-1,0]
        var k = (80*s-9) * Math.PI/18; // and    [0.5,1] -> [0,+1]

        if (s < 0) return -0.5*Math.pow(2, 10*s) * Math.sin( k );
        return          1 +0.5*Math.pow(2,-10*s) * Math.sin( k ); 
    },

    easeInExpo   : function(p) { if (p <= 0) return 0; return   Math.pow( 2,  10*(p-1) ); },
    easeOutExpo  : function(p) { if (p >= 1) return 1; return 1-Math.pow( 2, -10* p    ); },
    easeInOutExpo: function(p) { if (p <= 0) return 0;
                                 if (p >= 1) return 1;
                                 if (p <0.5) return             Math.pow( 2,  10*(2*p-1)-1);
                                             return           1-Math.pow( 2, -10*(2*p-1)-1);
    },

    easeInSine   : function(p) { return      1 - Math.cos( p * Math.PI*0.5 );  },
    easeInOutSine: function(p) { return 0.5*(1 - Math.cos( p * Math.PI     )); },
    easeOutSine  : function(p) { return          Math.sin( p * Math.PI*0.5 );  },
};